import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {PossibleResult, Question} from "../../shared/interfaces";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {QuestionsService} from "../../shared/services/questions.service";
import {DesignService} from "../../shared/classes/design";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {AnswerOptionsService} from "../../shared/services/answer-options.service";
import {PossibleResultsService} from "../../shared/services/possible-results.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-questions-form',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './questions-form.component.html',
  styleUrl: './questions-form.component.css'
})
export class QuestionsFormComponent implements OnInit, AfterViewInit {

  @Input('testId') testId: string;
  @Input('processingType') processingType: string;
  @ViewChild('popup', {static: true}) popupRef!: ElementRef;
  @ViewChild('overlay', {static: true}) overlayRef!: ElementRef;
  @ViewChild('closeBtn', {static: true}) closeRef!: ElementRef;
  @ViewChild('questionImageInput') questionImageInputRef: ElementRef;
  @ViewChildren('imageInput') imageInputs: QueryList<ElementRef>;


  questions: Question[] = [];
  possibleResults: PossibleResult[] = [];
  questionId: string | undefined = undefined;
  loading = false;
  form: FormGroup;
  questionImage: File;
  questionImagePreview: any;
  answerOptionImages: File[] = []; // Создаем массив для хранения изображений вариантов ответов
  answerOptionPreviews: any[] = [];


  constructor(private questionService: QuestionsService,
              private answerOptionService: AnswerOptionsService,
              private possibleResultService: PossibleResultsService,
              private fb: FormBuilder,
              private toastr: ToastrService) {

    this.form = this.fb.group({
      question: ['', Validators.required],
      answerOptions: this.fb.array([]),
      textAnswer: [false]
    });

  }

  ngOnInit() {
    this.loading = true;
    this.questionService.fetch(this.testId).subscribe({
      next: questions => {
        this.questions = questions;
        this.loading = false;
      }
    })
  }

  openModal(question: Question) {
    this.questionId = question._id;
    this.actualizePossibleResults()
    this.answerOptionPreviews = []
    this.form.patchValue({
      question: question.text,
      image: question.imageSrc,
      textAnswer: question.textAnswer
    });
    this.questionImagePreview = question.imageSrc

    if (question._id !== undefined) {
      this.answerOptionService.fetch(question._id).subscribe({
        next: answerOptions => {
          const answerOptionsFormArray = this.form.get('answerOptions') as FormArray;
          answerOptionsFormArray.clear();


          for (const answerOption of answerOptions) {
            const answerOptionGroup = this.fb.group({
              text: [answerOption.text, Validators.required],
              possibleResult: [answerOption.possibleResultId, Validators.required],
              score: [answerOption.score, Validators.required],
              _id: [answerOption._id],
              imageSrc: [answerOption.imageSrc]
            });
            this.answerOptionPreviews.push(answerOption.imageSrc)
            answerOptionsFormArray.push(answerOptionGroup);
          }
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => {
          this.popupRef.nativeElement.classList.add("active")
        }
      });
    }


  }

  onAddPosition() {
    (this.form.get('answerOptions') as FormArray).clear();
    this.actualizePossibleResults()
    this.questionId = undefined;
    this.questionImagePreview = ''
    this.answerOptionPreviews = []
    this.form.reset({
      name: null,
      description: null,
      possibleResult: null,
      textAnswer: false
    })
    this.popupRef.nativeElement.classList.add("active")


  }

  actualizePossibleResults() {
    this.possibleResultService.fetch(this.testId).subscribe({
      next: possibleResults => {
        this.possibleResults = possibleResults;
      }
    })
  }

  onDeleteQuestion(event: Event, question: Question) {
    event.stopPropagation()
    const decision = window.confirm(`Видалити питання ${question.text}?`)
    if (decision) {
      this.questionService.delete(question).subscribe({
        next: response => {
          const index = this.questions.findIndex(p => p._id === question._id)
          this.questions.splice(index, 1)
        },
        error: error => {
          this.toastr.error(error)
        }
      })
    }
  }

  addAnswerOption() {
    this.answerOptions.push(this.fb.group({
      text: '',
      possibleResult: '',
      score: 0
    }));
  }

  get answerOptions() {
    return this.form.get('answerOptions') as FormArray;
  }

  removeAnswerOption(index: number) {
    const answerOption = this.answerOptions.at(index).value
    if (answerOption._id !== undefined) {
      this.answerOptionService.delete(answerOption).subscribe({
        next: answerOptions => {
          this.answerOptions.removeAt(index);
        },
        error: err => {
          this.toastr.error(err)
        }
      })
    } else {
      this.answerOptions.removeAt(index);
    }

  }

  triggerClick() {
    this.questionImageInputRef.nativeElement.click();
  }

  triggerClickAO(event: Event, index: number) {
    const inputElement = this.imageInputs.toArray()[index].nativeElement;
    inputElement.click();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.questionImage = file

    const reader = new FileReader();

    reader.onload = (event: Event) => {
      this.questionImagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  onImageSelected(event: any, index: number) {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      this.answerOptionImages[index] = file; // Сохраняем изображение в массив
      const reader = new FileReader();
      reader.onload = () => {
        this.answerOptionPreviews[index] = reader.result; // Сохраняем предварительный просмотр изображения
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.form.disable()

    const answerOptionsFormArray = this.form.get('answerOptions') as FormArray;
    if (answerOptionsFormArray.length < 2 && !this.form.value.textAnswer) {
      this.toastr.error("Додайте принаймні 2 варіанти відповіді")
      this.form.enable()
      return
    }

    let allFieldsCorrect = true

    answerOptionsFormArray.controls.forEach((control: AbstractControl<any>, index: number) => {
      const answerOption = control.value;


      if (this.processingType == 'many') {
        if (answerOption.possibleResult == '' || answerOption.score == null || answerOption.text == '') {
          allFieldsCorrect = false
          return
        }
      } else if (this.processingType == 'one') {
        if (answerOption.score == null || answerOption.text == '') {
          allFieldsCorrect = false
          return;
        }
      } else if (this.processingType == 'self') {
        if (answerOption.text == '') {
          allFieldsCorrect = false
          return;
        }
      }
    })

    if (!allFieldsCorrect) {
      this.toastr.error('Заповніть всі поля варіантів відповдей')
      this.form.enable()
      return;
    }

    if (this.questionId) {
      this.questionService.update(
        this.questionId,
        this.form.value.question,
        this.testId,
        this.form.value.textAnswer.toString(),
        this.questionImage
      ).subscribe({
        next: question => {
          const index = this.questions.findIndex(p => p._id === question._id)
          this.questions[index] = question;
          this.toastr.success('Питання оновлено успішно')
          createOrUpdateAnswerOption()
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => completed()
      })
    } else {
      this.questionService.create(this.form.value.question, this.testId, this.form.value.textAnswer.toString(), this.questionImage).subscribe({
        next: question => {
          this.toastr.success('Питання створено')
          this.questions.push(question)
          this.questionId = question._id
          createOrUpdateAnswerOption()
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => completed()
      })

    }

    const createOrUpdateAnswerOption = () => { //Проверь в этом методе все ли поля заполнены
      const answerOptionsFormArray = this.form.get('answerOptions') as FormArray;
      answerOptionsFormArray.controls.forEach((control: AbstractControl<any>, index: number) => {
        const answerOption = control.value;
        const questionID = this.questionId ? this.questionId : '';
        const image = this.answerOptionImages[index];

        if (answerOption._id) {
          this.answerOptionService.update(
            answerOption._id,
            answerOption.text,
            questionID,
            answerOption.possibleResult,
            answerOption.score,
            image
          ).subscribe({
            next: updatedAnswerOption => {
              this.toastr.success('Варіант відповіді оновлено успішно');
            },
            error: err => {
              this.toastr.error(err);
            }
          });
        } else {
          this.answerOptionService.create(
            answerOption.text,
            questionID,
            answerOption.possibleResult,
            answerOption.score,
            image
          ).subscribe({
            next: createdAnswerOption => {
              this.toastr.success('Варіант відповіді створено успішно');
            },
            error: error => {
              this.toastr.error(error);
            }
          });
        }
      });
    };

    const completed = () => {
      this.popupRef.nativeElement.classList.remove("active")
      this.form.reset()
      this.form.enable()
    }
  }

  ngAfterViewInit() {
    DesignService.modalInit(this.popupRef, this.overlayRef, this.closeRef)
  }
}
