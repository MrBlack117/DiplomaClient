import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TestsService} from "../shared/services/tests.service";
import {UserTestResultService} from "../shared/services/user-test-result.service";
import {Question, Test, TestStatistics, UserTestResult} from "../shared/interfaces";
import {NgForOf, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {QuestionsService} from "../shared/services/questions.service";
import {AnswerOptionsService} from "../shared/services/answer-options.service";
import {PossibleResultsService} from "../shared/services/possible-results.service";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    NgIf
  ],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})
export class UserPageComponent implements OnInit {

  completedTestsData: { test: string, resultId: any, date: string }[] = []
  createdTestsData: { test: Test, results: UserTestResult[] }[] = []
  testsStatistics: Map<string,TestStatistics> = new Map<string,TestStatistics>();
  isPsychologist: boolean = true
  showTestStatistics: boolean = false
  selectedTestName: string
  testResults: any
  testQuestions: any
  user: { name: string, email: string }

  @ViewChild('userContent', {static: true}) userContentRef!: ElementRef;

  constructor(private testService: TestsService,
              private userTestResultService: UserTestResultService,
              private possibleResultsService: PossibleResultsService,
              private questionService: QuestionsService,
              private answerOptionService: AnswerOptionsService,
              private router: Router,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if(userData !== null){
      this.user = JSON.parse(userData);
    }


    this.userTestResultService.getByUser().subscribe({
      next: userTestResults => {
        for (const userTestResult of userTestResults) {
          this.testService.getById(userTestResult.test).subscribe({
            next: (test) => {
              const date = userTestResult.date;
              if (date !== undefined && date !== null) {
                const formattedDate = new Date(date).toLocaleDateString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit'
                });
                this.completedTestsData.push({
                  test: test.name,
                  resultId: userTestResult._id,
                  date: formattedDate
                })
              }

            },
            error: err => {
              this.toastr.error(err)
            }
          })
        }
      }, error: err => {
        this.toastr.error(err)
      }
    })
    this.testService.getByUser().subscribe({
      next: tests => {
        for (const test of tests) {
          this.userTestResultService.fetch(test._id).subscribe({
            next: (testResults: UserTestResult[]) => {
              this.createdTestsData.push({
                test: test,
                results: testResults
              })
            },
            error: err => {
              this.toastr.error(err)
            },
            complete: () => {
              if (this.createdTestsData.length === tests.length) {
                this.calculateStatistics()
                //console.log(this.testsStatistics)
                //console.log(this.completedTestsData)
              }
            }
          })
        }
      },
      error: err => {
        this.toastr.error(err)
      }
    })
  }


  calculateStatistics() {
    for (const testData of this.createdTestsData) {
      const testStats: TestStatistics = {
        testName: testData.test.name,
        possibleResults: [],
        questions: []
      };

      const testPossibleResults = testData.test.possibleResults
      const usersResults = testData.results
      const testId = testData.test._id


      testStats.possibleResults = this.calculatePossibleResultsStats(testPossibleResults, usersResults)
      testStats.questions = this.calculateQuestionsStats(testId, usersResults)
      this.testsStatistics.set(testId,testStats)
    }
  }

  calculatePossibleResultsStats(testPossibleResults: string[] | undefined, usersResults: UserTestResult[]) {
    const possibleResults: { name: string, frequency: number, percent: number }[] = []

    // Расчет частоты выбора возможных результатов
    const resultsFrequency = new Map<string, number>();
    if (testPossibleResults) {
      for (const possibleResult of testPossibleResults) {
        resultsFrequency.set(possibleResult, 0);
      }
    }

    for (const userResult of usersResults) {
      let bestScore = 0;
      let bestResultId = '';
      for (const possibleResult of userResult.results) {
        if (possibleResult.score > bestScore) {
          bestResultId = possibleResult._id;
          bestScore = possibleResult.score;
        }
      }
      if (resultsFrequency.has(bestResultId)) {
        const currentValue = resultsFrequency.get(bestResultId);
        if (currentValue !== undefined) {
          resultsFrequency.set(bestResultId, currentValue + 1);
        }
      } else {
        resultsFrequency.set(bestResultId, 1);
      }
    }

    // Расчет процентов выбора возможных результатов
    const totalResults = usersResults.length;
    for (const [resultId, frequency] of resultsFrequency.entries()) {
      const percent = (frequency / totalResults) * 100;

      this.possibleResultsService.get(resultId).subscribe({
        next: possibleResultObj => {
          possibleResults.push({name: possibleResultObj.name, frequency, percent});
        }
      })
    }

    return possibleResults
  }

  calculateQuestionsStats(testId: string, usersResults: UserTestResult[]) {
    const questionsStats: {
      name: string,
      answerOptions: { name: string, frequency: number, percent: number }[]
    }[] = [];

    // Расчет частоты выбора вариантов ответов на вопросы и их процентов
    let testQuestions: Question[] = [];
    this.questionService.fetch(testId).subscribe({
      next: questions => {
        testQuestions = questions;
      },
      error: (err) => {
        this.toastr.error(err)
      },
      complete: () => {
        for (const question of testQuestions) {
          const questionStatistics = {
            name: question.text,
            answerOptions: [] as { name: string, frequency: number, percent: number }[]
          };

          const answerOptionsFrequency = new Map<string, number>();
          const answerOptionsPercent = new Map<string, number>();
          const answerOptions = question.answerOptions;
          if (answerOptions) {
            for (const option of answerOptions) {
              answerOptionsFrequency.set(option, 0);
            }
          }

          for (const userResult of usersResults) {
            for (const userAnswer of userResult.answers) {
              if (answerOptionsFrequency.has(userAnswer)) {
                const currentValue = answerOptionsFrequency.get(userAnswer);
                if (currentValue !== undefined) {
                  answerOptionsFrequency.set(userAnswer, currentValue + 1);
                }
              }
            }
          }

          // Расчет процентов выбора вариантов ответов относительно всех вариантов ответа на вопрос
          const totalAnswers = usersResults.length;
          for (const frequency of answerOptionsFrequency.values()) {
            const percent = ((frequency / totalAnswers) * 100);
            answerOptionsPercent.set(frequency.toString(), percent);
          }

          for (const [option, frequency] of answerOptionsFrequency.entries()) {
            const percent = answerOptionsPercent.get(frequency.toString()) || 0;
            this.answerOptionService.getById(option).subscribe({
              next: answerOptionObj => {
                questionStatistics.answerOptions.push({name: answerOptionObj.text, frequency, percent});
              }
            })

          }

          questionsStats.push(questionStatistics);
        }
      }
    });

    return questionsStats
  }

  deleteTest(testId: string): void {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
      this.testService.delete(testId).subscribe({
        next: () => {
          this.createdTestsData = this.createdTestsData.filter(test => test.test._id !== testId);
        },
        error: (err: any) => {
          this.toastr.error(err)
        }
      });
    }
  }

  showStatistics(testId: string): void {

    this.userContentRef.nativeElement.classList.add('statistics-mode')

    const testStats = this.testsStatistics.get(testId)
    if (testStats) {
      this.showTestStatistics = true;
      this.selectedTestName = testStats.testName;
      this.testResults = testStats.possibleResults
      this.testQuestions = testStats.questions;
    } else {
      this.toastr.error('Тест не знайдено')
    }
  }

  normalMode(){
    this.userContentRef.nativeElement.classList.remove('statistics-mode')
  }

  logOut(){
    localStorage.removeItem('user')
    localStorage.removeItem('auth-token')
    this.router.navigate(['/auth'])
  }

}
