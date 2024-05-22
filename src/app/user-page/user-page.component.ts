import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TestsService} from "../shared/services/tests.service";
import {UserTestResultService} from "../shared/services/user-test-result.service";
import {Question, Test, TestStatistics, User, UserTestResult} from "../shared/interfaces";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {QuestionsService} from "../shared/services/questions.service";
import {AnswerOptionsService} from "../shared/services/answer-options.service";
import {PossibleResultsService} from "../shared/services/possible-results.service";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../shared/services/auth.service";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})
export class UserPageComponent implements OnInit {

  completedTestsData: { test: string, resultId: any, date: string }[] = []
  createdTestsData: { test: Test, results: UserTestResult[] }[] = []
  resultsList: { name: string, email: string, date: string, answers: string[], testId: string }[] = []
  testsStatistics: Map<string, TestStatistics> = new Map<string, TestStatistics>();
  isPsychologist: boolean = false
  isAdmin:boolean = false
  showTestStatistics: boolean = false
  showResultsList: boolean = false
  selectedTestName: string
  testResults: any
  testQuestions: any
  user: { name: string, email: string }
  resultAnswers: string[] = []
  selectedResult: {
    testName: string,
    user: { name: string, email: string },
    date: string,
    processedQuestions: { text: string, answerOptions: { id: string, text: string }[] }[]
  }
  form: FormGroup;



  @ViewChild('userContent', {static: true}) userContentRef!: ElementRef;

  constructor(private testService: TestsService,
              private userTestResultService: UserTestResultService,
              private possibleResultsService: PossibleResultsService,
              private questionService: QuestionsService,
              private answerOptionService: AnswerOptionsService,
              private authService: AuthService,
              private router: Router,
              private toastr: ToastrService) {
  }

  ngOnInit() {

    const userData = localStorage.getItem('user');
    const userId = localStorage.getItem('_id');

    if (userData !== null && userId !== null) {
      this.user = JSON.parse(userData);
      const id = JSON.parse(userId)
      this.authService.getUserData(id).subscribe({
        next: user => {
          const role = user.role
          if (role !== undefined) {
            if (role == 'psychologist') this.isPsychologist = true
            if (role == 'admin') this.isAdmin = true
          }
        }
      })
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
                this.completedTestsData.unshift({
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
              this.createdTestsData.unshift({
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

  async calculateStatistics() {
    for (const testData of this.createdTestsData) {
      const testStats: TestStatistics = {
        testName: testData.test.name,
        possibleResults: [],
        questions: []
      };

      const testPossibleResults = testData.test.possibleResults
      const usersResults = testData.results
      const testId = testData.test._id
      const processingType = testData.test.processingType


      if (processingType === 'one') {
        testStats.possibleResults = await this.calculatePossibleResultsStatsOne(testPossibleResults, usersResults)
      } else if (processingType === 'many') {
        testStats.possibleResults = this.calculatePossibleResultsStatsMany(testPossibleResults, usersResults)
      } else if (processingType === 'self') {

      }


      testStats.questions = this.calculateQuestionsStats(testId, usersResults)
      this.testsStatistics.set(testId, testStats)
    }
  }

  calculatePossibleResultsStatsMany(testPossibleResults: string[] | undefined, usersResults: UserTestResult[]) {
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
      const results = userResult.results
      if (results !== undefined) {
        for (const possibleResult of results) {
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

  async calculatePossibleResultsStatsOne(testPossibleResults: string[] | undefined, usersResults: UserTestResult[]): Promise<{ name: string, frequency: number, percent: number }[]> {
    const possibleResults: { name: string, frequency: number, percent: number }[] = [];
    const resultsFrequency = new Map<string, number>();

    if (testPossibleResults) {
      for (const possibleResult of testPossibleResults) {
        resultsFrequency.set(possibleResult, 0);
      }
    }

    let resultsProcessed = 0;

    const fetchPossibleResult = async (resultId: string) => {
      return this.possibleResultsService.get(resultId).toPromise();
    };

    const userResultsPromises = usersResults.map(async userResult => {
      const score = userResult.score;
      if (score !== undefined && testPossibleResults !== undefined) {
        for (const result of testPossibleResults) {
          const possibleResultObj = await fetchPossibleResult(result);
          const minScore = possibleResultObj?.minScore;
          const maxScore = possibleResultObj?.maxScore;
          if (minScore !== undefined && maxScore !== undefined) {
            if (minScore < score && score < maxScore) {
              const bestResultId = possibleResultObj?._id;
              if (bestResultId !== undefined) {
                if (resultsFrequency.has(bestResultId)) {
                  const currentValue = resultsFrequency.get(bestResultId);
                  if (currentValue !== undefined) {
                    resultsFrequency.set(bestResultId, currentValue + 1);
                  }
                } else {
                  resultsFrequency.set(bestResultId, 1);
                }
                resultsProcessed += 1;
              }
            }
          }
        }
      }
    });

    await Promise.all(userResultsPromises);

    const totalResults = usersResults.length;
    const resultsPromises = Array.from(resultsFrequency.entries()).map(async ([resultId, frequency]) => {
      const percent = (frequency / totalResults) * 100;
      const possibleResultObj = await fetchPossibleResult(resultId);
      if(possibleResultObj !== undefined){
        possibleResults.push({ name: possibleResultObj.name, frequency, percent });
      }

    });

    await Promise.all(resultsPromises);

    return possibleResults;
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

  showUserTestResultsList(testId: string, testName: string): void {
    this.showResultsList = true
    this.userContentRef.nativeElement.classList.add('users-results-mode')
    this.resultsList = this.getUsersTestResultsList(testId)
    this.selectedTestName = testName
  }

  getUsersTestResultsList(testId: string) {
    const userTestResultsList: { name: string, email: string, date: string, answers: string[], testId: string }[] = []
    this.userTestResultService.fetch(testId).subscribe({
      next: (results: UserTestResult[]) => {
        for (const result of results) {
          const userId = result.user
          if (userId !== undefined) {
            this.authService.getUserData(userId).subscribe({
              next: (user: User) => {
                if (result.date !== undefined && user.name !== undefined) {
                  const formattedDate = new Date(result.date).toLocaleDateString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit'
                  });
                  userTestResultsList.unshift({
                    name: user.name,
                    email: user.email,
                    date: formattedDate,
                    answers: result.answers,
                    testId: testId
                  })
                }
              }
            })
          }
        }
      }
    })
    return userTestResultsList
  }

  showUserAnswers(testId: string, answers: string[], testName: string, user: {
    name: string,
    email: string
  }, date: string) {
    this.userContentRef.nativeElement.classList.add('users-answers-mode')
    this.resultAnswers = answers

    const processedQuestions: { text: string, answerOptions: { id: string, text: string }[] }[] = []

    this.questionService.fetch(testId).subscribe({
      next: (questions) => {
        for (const question of questions) {
          const questionText = question.text
          const answers: { id: string, text: string }[] = []
          if (question._id !== undefined) {
            this.answerOptionService.fetch(question._id).subscribe({
              next: (response) => {
                for (const answerOption of response) {
                  const id = answerOption._id
                  const text = answerOption.text
                  if (id !== undefined) {
                    answers.push({id, text})
                  }
                }
              }
            })
          }
          processedQuestions.push({text: questionText, answerOptions: answers})

        }
      },
      error: (err: any) => {
        this.toastr.error(err)
      },
      complete: () => {
        this.selectedResult = {
          testName: testName,
          user: {name: user.name, email: user.email},
          date: date,
          processedQuestions: processedQuestions
        }
      }
    })
  }

  backFromStatistics() {
    this.userContentRef.nativeElement.classList.remove('statistics-mode')
  }

  backFromResults() {
    this.userContentRef.nativeElement.classList.remove('users-results-mode')
  }

  backFromAnswers() {
    this.userContentRef.nativeElement.classList.remove('users-answers-mode')
    this.userContentRef.nativeElement.classList.add('users-results-mode')
  }



  logOut() {
    localStorage.removeItem('user')
    localStorage.removeItem('auth-token')
    this.router.navigate(['/auth'])
  }

}
