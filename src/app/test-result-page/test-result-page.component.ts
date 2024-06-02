import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserTestResultService} from "../shared/services/user-test-result.service";
import {PossibleResult, ProcessedResult, UserTestResult, Comment} from "../shared/interfaces";
import {ActivatedRoute, Params} from "@angular/router";
import {PossibleResultsService} from "../shared/services/possible-results.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {DesignService} from "../shared/classes/design";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommentsService} from "../shared/services/comments.service";
import {AuthService} from "../shared/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {TestsService} from "../shared/services/tests.service";
import * as echarts from 'echarts';

@Component({
  selector: 'app-test-result-page',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './test-result-page.component.html',
  styleUrl: './test-result-page.component.css'
})
export class TestResultPageComponent implements OnInit, AfterViewInit {

  bestResult: ProcessedResult;
  userTestResult: UserTestResult
  results: ProcessedResult[] = [];
  comments: { userName: string, commentText: string }[] = [];
  loading = false
  form: FormGroup;
  userReaction: string = ''
  processingType: string = ''

  @ViewChild('accordionItems', {static: true}) accordionItemsRef!: ElementRef;


  constructor(private userTestResultService: UserTestResultService,
              private possibleResultsService: PossibleResultsService,
              private commentsService: CommentsService,
              private authService: AuthService,
              private testService: TestsService,
              private route: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      text: new FormControl(null, [Validators.required])
    })

    this.loading = true;
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.userTestResultService.getById(params['id']).subscribe({
          next: (result: UserTestResult) => {
            this.userTestResult = result;
            this.testService.getById(result.test).subscribe({
              next: (test) => {
                this.processingType = test.processingType
                this.processResults()
                this.loadComments(result.test)
                this.checkReaction()
              }
            })

          },
          error: (err) => {
            this.toastr.error(err)
          }
        });
      }
    });

  }

  processResults() {
    if (this.processingType === 'one') {
      const score = this.userTestResult.score
      if (score !== undefined) {
        this.possibleResultsService.fetch(this.userTestResult.test).subscribe({
          next: (results) => {
            for (const result of results) {
              const minScore = result.minScore
              const maxScore = result.maxScore
              if (minScore !== undefined && maxScore !== undefined) {
                if (minScore < score && score <= maxScore) {
                  const processedResult: ProcessedResult = {
                    name: result.name,
                    description: result.description,
                    imageSrc: result.imageSrc,
                    score: score
                  };
                  this.bestResult = processedResult
                }
              }
            }
          },
          error: err => {
            this.toastr.error(err)
          },
          complete: () => {
            this.loading = false;
          }
        })
      }

    } else if (this.processingType === 'many') {
      const results = this.userTestResult.results
      if (results !== undefined) {
        results.forEach((possibleResult) => {
          this.possibleResultsService.get(possibleResult._id).subscribe({
            next: (result: PossibleResult) => {
              const processedResult: ProcessedResult = {
                name: result.name,
                description: result.description,
                imageSrc: result.imageSrc,
                score: possibleResult.score
              };
              this.results.push(processedResult);
            },
            error: (err) => {
              this.toastr.error(err)
            },
            complete: () => {
              let bestScore = -1;
              if (this.results.length == results.length) {
                for (const r of this.results) {
                  if (r.score > bestScore) {
                    this.bestResult = r;
                    bestScore = r.score;
                  }
                }
                this.loading = false;
              }

            }
          });
        });
      }

    } else if (this.processingType === 'category') {
      const results = this.userTestResult.results
      if (results !== undefined) {
        results.forEach((possibleResult) => {
          this.possibleResultsService.get(possibleResult._id).subscribe({
            next: (result: PossibleResult) => {
              const processedResult: ProcessedResult = {
                name: result.name,
                description: result.description,
                imageSrc: result.imageSrc,
                score: possibleResult.score,
                minScore: result.minScore,
                maxScore: result.maxScore
              };
              this.results.push(processedResult);
            },
            error: (err) => {
              this.toastr.error(err)
            },
            complete: () => {
              const processedResult: ProcessedResult = {
                name: 'Дякуємо за проходження тесту!',
                description: 'Результати тестування зображені нижче.',
                imageSrc: '',
                score: 100
              };
              this.bestResult = processedResult
              this.initChart();
              this.loading = false;
            }
          });
        });
      }
    } else if (this.processingType === 'self') {
      const processedResult: ProcessedResult = {
        name: 'Дякуємо за проходження тесту!',
        description: 'Ваші відповіді будуть проаналізовані психологом. Зверніться до нього для отримання результату.',
        imageSrc: '',
        score: 100
      };
      this.bestResult = processedResult
      this.loading = false
    }
  }

  initChart() {
    const chartElement = document.getElementById('chart') as HTMLDivElement;
    const myChart = echarts.init(chartElement);

    const categories = this.results.map(result => result.name);
    const scores = this.results.map(result => result.score);
    const minScores = this.results.map(result => result.minScore);
    const maxScores = this.results.map(result => result.maxScore);

    const option = {
      legend: {
        textStyle:{
          color: 'grey',
          fontSize: '0.85rem'
        }
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Ваш результат',
          type: 'bar',
          data: scores,
          itemStyle: {
            opacity: 0.6
          }
        },
        {
          name: 'Мінімальне значення',
          type: 'scatter',
          data: minScores,
          symbol: 'rect',
          symbolSize: [100, 5],
          itemStyle: {
            color: 'blue'
          }
        },
        {
          name: 'Максимальне значення',
          type: 'scatter',
          data: maxScores,
          symbol: 'rect',
          symbolSize: [100, 5],
          itemStyle: {
            color: 'red'
          }
        }
      ]
    };

    myChart.setOption(option);
  }

  loadComments(testId: string) {
    const testComments: { userName: string, commentText: string }[] = []
    this.commentsService.fetch(testId).subscribe({
      next: comments => {
        for (const comment of comments) {
          const userId = comment.userId
          if (userId !== undefined) {
            const user = this.authService.getUserData(userId).subscribe({
              next: user => {
                const name = user.name
                if (name !== undefined) {
                  testComments.push({
                    userName: name,
                    commentText: comment.text
                  })
                }
              },
              error: err => {
                this.toastr.error(err)
              }
            })
          }
        }
      },
      error: err => {
        this.toastr.error(err)
      },
      complete: () => {
        this.comments = testComments
      }
    })
  }

  checkReaction() {
    const testId = this.userTestResult.test
    const userId = this.userTestResult.user
    if (userId !== undefined) {
      this.authService.getUserData(userId).subscribe({
        next: user => {
          const likedTests = user.likedTests
          const dislikedTests = user.dislikedTests
          if (likedTests?.includes(testId)) {
            this.userReaction = 'like'
          }
          if (dislikedTests?.includes(testId)) {
            this.userReaction = 'dislike'
          }
        },
        error: err => {
          console.log(err)
        }
      })
    }
  }

  addReaction(reaction: string) {

    this.testService.addReaction(this.userTestResult.test, reaction).subscribe({
      next: message => {
        this.toastr.success('Дякуємо за Вашу оцінку!')
      },
      error: err => {
        this.toastr.error(err)
      }
    })
    this.userReaction = reaction

  }


  ngAfterViewInit() {
    DesignService.accordionSetup(this.accordionItemsRef)
  }

  onSubmit() {
    this.form.disable()
    const userComment: Comment = {
      testId: this.userTestResult.test,
      text: this.form.value.text
    }
    this.commentsService.create(userComment).subscribe({
      next: comment => {
        this.toastr.success('Коментар додано')
      },
      error: err => {
        this.toastr.error(err)
      },
      complete: () => {
        this.form.enable()
        this.loadComments(this.userTestResult.test)
      }
    })
  }
}
