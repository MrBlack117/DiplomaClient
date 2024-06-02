import {Component, OnInit} from '@angular/core';
import {TestsService} from "../shared/services/tests.service";
import {AnswerOption, Question, Test, UserTestResult, Result} from "../shared/interfaces";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {QuestionsService} from "../shared/services/questions.service";
import {AnswerOptionsService} from "../shared/services/answer-options.service";
import {UserTestResultService} from "../shared/services/user-test-result.service";
import {ToastrService} from "ngx-toastr";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent implements OnInit {

  loading = true;
  test: Test;
  questions: Question[];
  selectedOptions: AnswerOption[] = [];
  textAnswers: {
    questionId: string,
    text: string,
  }[] = [];
  answeredTextIndexes: number[] = [];
  currentQuestionIndex: number = 0;
  progressPercent: number = 0

  constructor(private testsService: TestsService,
              private questionService: QuestionsService,
              private answerOptionService: AnswerOptionsService,
              private userTestResultService: UserTestResultService,
              private route: ActivatedRoute,
              private router: Router,
              private toastr: ToastrService) {
  }


  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.testsService.getById(params['id']).subscribe({
          next: (test: Test) => {
            this.test = test;
          },
          error: (err) => {
            this.toastr.error(err)
          }
        });

        this.questionService.fetch(params['id']).subscribe({
          next: (questions: Question[]) => {
            this.questions = questions
          },
          error: (err) => {
            this.toastr.error(err)
          },
          complete: () => {
            if (this.questions !== undefined) {
              for (const question of this.questions) {
                if (question._id !== undefined) {
                  this.answerOptionService.fetch(question._id).subscribe({
                    next: (answerOptions: AnswerOption[]) => {
                      question.answerOptionsObj = answerOptions
                    },
                    error: (err) => {
                      this.toastr.error(err)
                    },
                    complete: () => {
                      this.loading = false
                    }
                  })
                }
              }
            }
          }
        });
      }
    })
  }

  onOptionSelect(option: AnswerOption, index: number) {
    if (this.selectedOptions[index] === undefined) {
      this.currentQuestionIndex += 1
      this.updateProgress();
    }
    this.selectedOptions[index] = option

  }

  onTextAnswerChange(event: Event, questionId: string | undefined, index: number): void {
    if (!this.answeredTextIndexes.includes(index)) {
      this.currentQuestionIndex += 1;
      this.answeredTextIndexes.push(index);
      this.updateProgress();
    }
    const newText = (event.target as HTMLInputElement).value;
    if (questionId !== undefined) {
      this.textAnswers[index] = {
        questionId: questionId,
        text: newText,
      }
    }
  }

  updateProgress() {
    this.progressPercent = (this.currentQuestionIndex / this.questions.length * 100);
  }


  onSubmit() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.toastr.info("Будь ласка, дайте відповіді на всі питання")
      return
    }

    const results: Result[] = []
    const answers: any[] = []


    if (this.test.processingType === 'one') {
      let testScore: number = 0;


      for (const selectedOption of this.selectedOptions) {
        answers.push(selectedOption._id)
        const answerPoints = selectedOption.score;
        if (answerPoints !== undefined) {
          testScore += answerPoints;
        }
      }

      for (const textAnswer of this.textAnswers) {
        if (textAnswer !== undefined) {
          for (const question of this.questions) {
            const options = question.answerOptionsObj
            if (options !== undefined) {
              for (const option of options) {
                if (option.text.toLowerCase() === textAnswer.text.toLowerCase()) {
                  answers.push(option._id)
                  const answerPoints = option.score;
                  if (answerPoints !== undefined) {
                    testScore += answerPoints;
                  }
                }
              }
            }
          }
        }
      }


      const newUserTestResult: UserTestResult = {
        test: this.test._id,
        score: testScore,
        answers: answers
      };

      this.userTestResultService.create(newUserTestResult).subscribe({
          next: (response) => {
            this.router.navigate([`/result/${response._id}`]);
          },
          error: (errorResponse) => {
            this.toastr.error(errorResponse.error)
          }
        }
      );

    } else if (this.test.processingType === 'many') {
      if (this.test.possibleResults !== undefined) {
        const resultsMap: { [key: string]: number } = {};

        this.test.possibleResults.forEach(possibleResultId => {
          resultsMap[possibleResultId] = 0;
        });

        for (const selectedOption of this.selectedOptions) {
          if (selectedOption != undefined) {
            answers.push(selectedOption._id)
            const possibleResultId = selectedOption.possibleResultId;
            const answerPoints = selectedOption.score;
            if (possibleResultId !== undefined && answerPoints !== undefined) {
              resultsMap[possibleResultId] += answerPoints;
            }
          }

        }

        for (const textAnswer of this.textAnswers) {
          if (textAnswer != undefined) {
            for (const question of this.questions) {
              const options = question.answerOptionsObj
              if (options !== undefined) {
                for (const option of options) {
                  if (option.text.toLowerCase() === textAnswer.text.toLowerCase()) {
                    answers.push(option._id)
                    const possibleResultId = option.possibleResultId;
                    const answerPoints = option.score;
                    if (possibleResultId !== undefined && answerPoints !== undefined) {
                      resultsMap[possibleResultId] += answerPoints;
                    }
                  }
                }
              }
            }
          }

        }

        Object.entries(resultsMap).forEach(([possibleResultId, score]) => {
          results.push({_id: possibleResultId, score});
        });

      }

      const newUserTestResult: UserTestResult = {
        test: this.test._id,
        results: results,
        answers: answers
      };

      this.userTestResultService.create(newUserTestResult).subscribe({
          next: (response) => {
            this.router.navigate([`/result/${response._id}`]);
          },
          error: (errorResponse) => {
            this.toastr.error(errorResponse.error)
          }
        }
      );

    } else if (this.test.processingType === 'category') {
      let testScore: number = 0;

      if (this.test.possibleResults !== undefined) {
        const resultsMap: { [key: string]: number } = {};


        this.test.possibleResults.forEach(possibleResultId => {
          resultsMap[possibleResultId] = 0;
        });

        for (const selectedOption of this.selectedOptions) {
          if (selectedOption != undefined) {
            answers.push(selectedOption._id)
            const possibleResultId = selectedOption.possibleResultId;
            const answerPoints = selectedOption.score;
            if (possibleResultId !== undefined && answerPoints !== undefined) {
              resultsMap[possibleResultId] += answerPoints;
              testScore += answerPoints;
            }
          }

        }

        for (const textAnswer of this.textAnswers) {
          if (textAnswer != undefined) {
            for (const question of this.questions) {
              const options = question.answerOptionsObj
              if (options !== undefined) {
                for (const option of options) {
                  if (option.text.toLowerCase() === textAnswer.text.toLowerCase()) {
                    answers.push(option._id)
                    const possibleResultId = option.possibleResultId;
                    const answerPoints = option.score;
                    if (possibleResultId !== undefined && answerPoints !== undefined) {
                      resultsMap[possibleResultId] += answerPoints;
                      testScore += answerPoints;
                    }
                  }
                }
              }
            }
          }

        }

        Object.entries(resultsMap).forEach(([possibleResultId, score]) => {
          results.push({_id: possibleResultId, score});
        });

      }

      const newUserTestResult: UserTestResult = {
        test: this.test._id,
        results: results,
        score: testScore,
        answers: answers
      };

      this.userTestResultService.create(newUserTestResult).subscribe({
          next: (response) => {
            this.router.navigate([`/result/${response._id}`]);
          },
          error: (errorResponse) => {
            this.toastr.error(errorResponse.error)
          }
        }
      );

    } else if (this.test.processingType === 'self') {
      if (this.test.possibleResults !== undefined) {
        for (const selectedOption of this.selectedOptions) {
          answers.push(selectedOption._id)
        }
      }

      const newUserTestResult: UserTestResult = {
        test: this.test._id,
        answers: answers,
        textAnswers: this.textAnswers,
      };

      this.userTestResultService.create(newUserTestResult).subscribe({
          next: (response) => {
            this.router.navigate([`/result/${response._id}`]);
          },
          error: (errorResponse) => {
            this.toastr.error(errorResponse.error)
          }
        }
      );
    }


  }
}

