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
            this.userTestResult.results.forEach((possibleResult) => {
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
                  if (this.results.length == this.userTestResult.results.length) {
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
            this.loadComments(result.test)
            this.checkReaction()
          },
          error: (err) => {
            this.toastr.error(err)
          }
        });
      }
    });

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
        },
        complete: () => {
          console.log(this.userReaction)
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
        //console.log(comment)
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
