import {Component, OnInit} from '@angular/core';
import {TestsService} from "../shared/services/tests.service";
import {AnswerOption, Question, Test, UserTestResult, Result} from "../shared/interfaces";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {QuestionsService} from "../shared/services/questions.service";
import {AnswerOptionsService} from "../shared/services/answer-options.service";
import {UserTestResultService} from "../shared/services/user-test-result.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent implements OnInit {

  loading = true;
  test: Test;
  questions: Question[];
  selectedOptions: AnswerOption[] = [];
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
                      //console.log(this.questions)
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

  updateProgress() {
    this.progressPercent = (this.currentQuestionIndex / this.questions.length * 100);
  }

  onSubmit() {
    const results: Result[] = []
    const answers: any[] = []

    if (this.test.possibleResults !== undefined) {
      const resultsMap: { [key: string]: number } = {};

      this.test.possibleResults.forEach(possibleResultId => {
        resultsMap[possibleResultId] = 0;
      });

      for (const selectedOption of this.selectedOptions) {
        answers.push(selectedOption._id)
        const possibleResultId = selectedOption.possibleResultId;
        resultsMap[possibleResultId] += selectedOption.score;
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
  }
}

