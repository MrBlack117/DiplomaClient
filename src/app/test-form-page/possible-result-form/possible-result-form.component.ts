import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DesignService} from "../../shared/classes/design";
import {PossibleResultsService} from "../../shared/services/possible-results.service";
import {PossibleResult} from "../../shared/interfaces";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
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
  @Input('processingType') processingType: string;
  @ViewChild('popup', {static: true}) popupRef!: ElementRef;
  @ViewChild('overlay', {static: true}) overlayRef!: ElementRef;
  @ViewChild('imageInput') imageInputRef: ElementRef;


  possibleResults: PossibleResult[] = [];
  possibleResultId: string | undefined = undefined;
  loading = false;
  form: FormGroup;
  image: File;
  imagePreview: any;
  scoreErrors: string[] = []


  constructor(private possibleResultService: PossibleResultsService, private toastr: ToastrService) {
  }

  ngOnInit() {

    console.log(this.processingType)

    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      minScore: new FormControl(null),
      maxScore: new FormControl(null),
      isLowest: new FormControl(false),
      isHighest: new FormControl(false)
    }, {validators: this.scoreValidator()})


    this.loading = true;
    this.possibleResultService.fetch(this.testId).subscribe({
      next: possibleResults => {
        if (possibleResults != null) {
          this.possibleResults = possibleResults;
        }
        this.loading = false;
        this.scoreErrors = this.checkScoresCorrectness()
      }
    })
  }

  scoreValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {

      if(this.processingType == 'many'){
        return null
      }

      const minScore = formGroup.get('minScore')?.value;
      const isLowest = formGroup.get('isLowest')?.value;
      const maxScore = formGroup.get('maxScore')?.value;
      const isHighest = formGroup.get('isHighest')?.value;

      const errors: any = {};

      if ((minScore === null || minScore === '') && !isLowest) {
        errors.minScoreRequired = 'Minimum score is required';
      }

      if ((maxScore === null || maxScore === '') && !isHighest) {
        errors.maxScoreRequired = 'Maximum score is required';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  openModal(possibleResult: PossibleResult) {
    this.possibleResultId = possibleResult._id;
    this.imagePreview = possibleResult.imageSrc;

    if (possibleResult.maxScore === Number.MAX_SAFE_INTEGER) {
      this.form.get('isHighest')?.setValue(true);
      this.form.get('maxScore')?.setValue('')
      this.form.get('maxScore')?.disable()
    } else {
      this.form.get('isHighest')?.setValue(false);
      this.form.get('maxScore')?.setValue(possibleResult.maxScore);
      this.form.get('maxScore')?.enable()
    }

    if (possibleResult.minScore === Number.MIN_SAFE_INTEGER) {
      this.form.get('isLowest')?.setValue(true);
      this.form.get('minScore')?.setValue('');
      this.form.get('minScore')?.disable()
    } else {
      this.form.get('isLowest')?.setValue(false);
      this.form.get('minScore')?.setValue(possibleResult.minScore);
      this.form.get('minScore')?.enable()
    }

    this.form.patchValue({
      name: possibleResult.name,
      description: possibleResult.description,
      image: possibleResult.imageSrc
    });

    this.popupRef.nativeElement.classList.add("active");
  }

  onAddPosition() {
    this.possibleResultId = undefined;
    this.imagePreview = '';
    this.form.reset({
      name: null,
      description: null,
      maxScore: null,
      minScore: null
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
          this.scoreErrors = this.checkScoresCorrectness()
        },
        error: error => {
          this.toastr.error(error)
        }
      })
    }
  }

  onSubmit() {
    this.form.disable()

    let minScore: number;
    let maxScore: number;
    const isLowest = this.form.value.isLowest;
    const isHighest = this.form.value.isHighest;


    if (isLowest) {
      minScore = Number.MIN_SAFE_INTEGER
    } else {
      minScore = this.form.value.minScore;
    }

    if (isHighest) {
      maxScore = Number.MAX_SAFE_INTEGER
    } else {
      maxScore = this.form.value.maxScore;
    }

    if (minScore !== null && maxScore !== null) {
      if (minScore >= maxScore) {
        this.toastr.error('Нижня границя має бути менше верхньої');
        this.form.enable()
        return;
      }

    }

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
        this.image,
        maxScore,
        minScore
      ).subscribe({
        next: possibleResult => {
          const index = this.possibleResults.findIndex(p => p._id === possibleResult._id)
          this.possibleResults[index] = possibleResult;
          this.toastr.success('Можливий результат оновлено успішно')
          this.scoreErrors = this.checkScoresCorrectness()
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
        this.image,
        maxScore,
        minScore
      ).subscribe({
        next: possibleResult => {
          this.toastr.success('Можливий результат створено')
          this.possibleResults.push(possibleResult)
          this.scoreErrors = this.checkScoresCorrectness()
        },
        error: err => {
          this.toastr.error(err)
        },
        complete: () => completed()
      })
    }


  }

  checkScoresCorrectness(): string[] {

    const min: number[] = []
    const max: number[] = []
    for (const possibleResult of this.possibleResults) {
      if (possibleResult.maxScore !== undefined) {
        max.push(possibleResult.maxScore)
      }
      if (possibleResult.minScore !== undefined) {
        min.push(possibleResult.minScore)
      }
    }

    const errors: string[] = [];
    let posInf = false
    let negInf = false


    // Фильтруем повторы
    const minScores = min.filter(minElement => {
      return !max.includes(minElement);
    });

    const maxScores = max.filter(maxElement => {
      return !min.includes(maxElement);
    });


    //сортируем
    maxScores.sort((a, b) => b - a)
    minScores.sort((a, b) => b - a)


    // Провеяем бесконечности
    // Проверяем наличие Number.MIN_SAFE_INTEGER в массиве minScores
    if (minScores.includes(Number.MIN_SAFE_INTEGER)) {
      minScores.pop()
      negInf = true
    }

    // Проверяем наличие Number.MAX_SAFE_INTEGER в массиве maxScores
    if (maxScores.includes(Number.MAX_SAFE_INTEGER)) {
      maxScores.shift()
      posInf = true
    }


    if (!posInf) {
      const highestValue = maxScores.shift()
      if (highestValue !== undefined) {
        errors.push('Пропущена частина від ' + highestValue + ' до +нескінченності')
      }

    }

    if (!negInf) {
      const lowestValue = minScores.pop()
      if (lowestValue !== undefined) {
        errors.push('Пропущена частина від -нескінченності до ' + lowestValue)
      }

    }


    const numberOfEmptySpaces = maxScores.length
    let lastLowerBorder = Number.MAX_SAFE_INTEGER

    for (let i = 0; i < numberOfEmptySpaces; i++) {

      const spaceErrors: string[] = []
      const upperBorder = maxScores.shift()
      const lowerBorder = minScores.shift()


      if (upperBorder !== undefined && lowerBorder !== undefined) {

        if (upperBorder >= lastLowerBorder) {
          errors.push('Порушена коректність проміжків, будь-ласка перевірте їх!')
          break
        }


        lastLowerBorder = lowerBorder
        if (upperBorder < lowerBorder) {
          errors.push('Пропущена частина від ' + upperBorder + ' до ' + lowerBorder)
        } else {
          errors.push('Двічі повторюється частина від ' + lowerBorder + ' до ' + upperBorder)
        }

      }
    }

    return errors
  }

  onCheckBoxChange(event: any, controlName: string) {
    const checked = event.target.checked;
    const control = this.form.get(controlName);
    if (checked) {
      control?.setValue(null);
      control?.disable();
    } else {
      control?.enable();
    }
  }

  ngAfterViewInit() {
    DesignService.modalInit(this.popupRef, this.overlayRef)
  }
}
