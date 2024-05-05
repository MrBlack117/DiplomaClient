import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {QuestionsFormComponent} from "./questions-form/questions-form.component";
import {PossibleResultFormComponent} from "./possible-result-form/possible-result-form.component";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {TestsService} from "../shared/services/tests.service";
import {Observable, of, switchMap} from "rxjs";
import {Test} from "../shared/interfaces";
import {ToastrService} from "ngx-toastr";
import {environment} from "../../environments/environment";

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
  test: Test;
  apiUrl = environment.apiUrl + '/';


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

  deleteTest(){
    const decision = window.confirm(`Ви впевнені, що хочете видалити тест ${this.test.name}?`)

    if(decision){
      this.testService.delete(this.test._id)
        .subscribe({
          next: response => {
            this.toastr.success(response.message)
          },
          error: (errorResponse:any) => {
            this.toastr.error(errorResponse.error.message)
          },
          complete: () => {
            this.router.navigate(['/'])
          }
        })
    }
  }

  onSubmit() {
    let obs: Observable<Test>;
    this.form.disable()
    if (this.isNew) {
      obs = this.testService.create(this.form.value.name, this.form.value.brief, this.form.value.description, this.image)
    } else {
      obs = this.testService.update(this.test._id, this.form.value.name, this.form.value.brief, this.form.value.description, this.image)
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
