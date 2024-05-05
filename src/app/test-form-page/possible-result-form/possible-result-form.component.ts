import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DesignService} from "../../shared/classes/design";
import {PossibleResultsService} from "../../shared/services/possible-results.service";
import {PossibleResult} from "../../shared/interfaces";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-possible-result-form',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './possible-result-form.component.html',
  styleUrl: './possible-result-form.component.css'
})
export class PossibleResultFormComponent implements OnInit, AfterViewInit {

  @Input('testId') testId: string;
  @ViewChild('popup', {static: true}) popupRef!: ElementRef;
  @ViewChild('overlay', {static: true}) overlayRef!: ElementRef;
  @ViewChild('imageInput') imageInputRef: ElementRef;


  possibleResults: PossibleResult[] = [];
  possibleResultId: string | undefined = undefined;
  loading = false;
  form: FormGroup;
  image: File;
  imagePreview: any;


  constructor(private possibleResultService: PossibleResultsService, private toastr: ToastrService) {
  }

  ngOnInit() {

    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required])
    })


    this.loading = true;
    this.possibleResultService.fetch(this.testId).subscribe({
      next: possibleResults => {
        if (possibleResults != null) {
          this.possibleResults = possibleResults;
        }
        this.loading = false;
      }
    })
  }

  openModal(possibleResult: PossibleResult) {
    this.possibleResultId = possibleResult._id;
    this.form.patchValue({
      name: possibleResult.name,
      description: possibleResult.description,
      image: possibleResult.imageSrc
    })
    this.imagePreview = possibleResult.imageSrc
    this.popupRef.nativeElement.classList.add("active")

  }

  onAddPosition() {
    this.possibleResultId = undefined;
    this.imagePreview = '';
    this.form.reset({
      name: null,
      description: null
    })
    this.popupRef.nativeElement.classList.add("active")

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

  onDeletePossibleResult(event: Event, possibleResult: PossibleResult) {
    event.stopPropagation()
    const decision = window.confirm(`Видалити можливий результат ${possibleResult.name}?`)
    if (decision) {
      this.possibleResultService.delete(possibleResult).subscribe({
        next: response => {
          const index = this.possibleResults.findIndex(p => p._id === possibleResult._id)
          this.possibleResults.splice(index, 1)
        },
        error: error => {
         this.toastr.error(error)
        }
      })
    }
  }

  onSubmit() {
    this.form.disable()

    const completed = () => {
      this.popupRef.nativeElement.classList.remove("active")
      this.form.reset()
      this.form.enable()
    }

    if (this.possibleResultId) {
      this.possibleResultService.update(
        this.possibleResultId,
        this.form.value.name,
        this.form.value.description,
        this.testId,
        this.image
      ).subscribe({
        next: possibleResult => {
          const index = this.possibleResults.findIndex(p => p._id === possibleResult._id)
          this.possibleResults[index] = possibleResult;
          this.toastr.success('Можливий результат оновлено успішно')
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => completed()
      })
    } else {
      this.possibleResultService.create(
        this.form.value.name,
        this.form.value.description,
        this.testId,
        this.image
      ).subscribe({
        next: possibleResult => {
          this.toastr.success('Можливий результат створено')
          //console.log(possibleResult)
          this.possibleResults.push(possibleResult)
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => completed()
      })
    }
  }

  ngAfterViewInit() {
    DesignService.modalInit(this.popupRef, this.overlayRef)
  }
}
