import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {QuestionsFormComponent} from "./questions-form/questions-form.component";
import {PossibleResultFormComponent} from "./possible-result-form/possible-result-form.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {TestsService} from "../shared/services/tests.service";
import {Observable, of, switchMap} from "rxjs";
import {PossibleResult, Test} from "../shared/interfaces";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-test-form-page',
  standalone: true,
  imports: [
    QuestionsFormComponent,
    PossibleResultFormComponent,
    ReactiveFormsModule,
    NgClass,
    NgIf
  ],
  templateUrl: './test-form-page.component.html',
  styleUrl: './test-form-page.component.css'
})


export class TestFormPageComponent implements OnInit {

  @ViewChild('imageInput') imageInputRef: ElementRef;
  form: FormGroup;
  image: File;
  imagePreview: any;
  isNew = true;
  processingType: string = 'one'
  test: Test;

  constructor(private route: ActivatedRoute, private testService: TestsService, private router: Router,
              private toastr: ToastrService) {
  }

  ngOnInit() {

    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      brief: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required])
    })

    this.form.disable()

    this.route.params
      .pipe(
        switchMap((params: Params) => {
          if (params['id']) {
            this.isNew = false
            return this.testService.getById(params['id'])
          }

          return of(null)
        })
      )
      .subscribe({
          next: (test) => {
            if (test) {
              this.test = test
              this.processingType = test.processingType
              this.form.patchValue({
                name: test.name,
                brief: test.brief,
                description: test.description,
              })
              this.imagePreview = test.imageSrc
            }

            this.form.enable()
          },
          error: (error: Error) => {
            console.warn(error)
          }
        }
      )


  }

  triggerClick() {
    this.imageInputRef.nativeElement.click();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file

    const reader = new FileReader();

    reader.onload = (event: Event) => {
      this.imagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  deleteTest() {
    const decision = window.confirm(`Ви впевнені, що хочете видалити тест ${this.test.name}?`)

    if (decision) {
      this.testService.delete(this.test._id)
        .subscribe({
          next: response => {
            this.toastr.success(response.message)
          },
          error: (errorResponse: any) => {
            this.toastr.error(errorResponse.error.message)
          },
          complete: () => {
            this.router.navigate(['/'])
          }
        })
    }
  }


  processingInfo(type: string) {
    if (type === "one") {
      this.toastr.info('У тесту є загальний лічильник і в залежності від обраної відповіді до нього додаються або\n' +
        '                    віднімаються бали.\n' +
        '                    Кожному можлимову результату потрібно виставити рамки балів. Після проходження тесту, користувач\n' +
        '                    отримає\n' +
        '                    результат в рамки якого потрапило значення лічильника балів тесту', 'Загальний лічильник', {
        timeOut: 10000,
        closeButton: true,
        progressBar: true

      })
    } else if (type === "many") {
      this.toastr.info('Кожен можливий результат маж свій лічильник балів. До кожного варіанту відповіді можна обрати\n' +
        '                    можливий\n' +
        '                    результат\n' +
        '                    до якого будуть нараховуватися бали та кількість балів, що буде наразована. Після проходження тесту,\n' +
        '                    користувач\n' +
        '                    отримає результат, який набрав більше балів.', 'Окремі лічильники', {
        timeOut: 15000,
        closeButton: true,
        progressBar: true

      })
    } else if (type === "self") {
      this.toastr.info('Варіанти проходження не враховуються.' +
        ' Ви зможете бачити відповіді користувачів, ' +
        'і маєте проаналізувати їх самостійно.', 'Самостійний аналіз', {
        timeOut: 15000,
        closeButton: true,
        progressBar: true

      })
    }
  }

  onSubmit() {
    let obs: Observable<Test>;
    this.form.disable()
    if (this.isNew) {
      obs = this.testService.create(this.form.value.name, this.form.value.brief, this.form.value.description, this.processingType, this.image)
    } else {
      obs = this.testService.update(this.test._id, this.form.value.name, this.form.value.brief, this.form.value.description, this.processingType, this.image)
    }
    obs.subscribe({
      next: (test) => {
        this.test = test
        this.toastr.success('Тест успішно збережено')
        this.form.enable()
      },
      error: (errorResponse: any) => {
        this.toastr.error(errorResponse.error.message)
        this.form.enable()
      }
    })
  }

}
