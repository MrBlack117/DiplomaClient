import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {TestsService} from '../shared/services/tests.service';
import {QuestionsService} from '../shared/services/questions.service';
import {AnswerOptionsService} from '../shared/services/answer-options.service';
import {UserTestResultService} from '../shared/services/user-test-result.service';
import {AnswerOption, Question, Test, UserTestResult, Result} from '../shared/interfaces';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {
  loading = true;
  test: Test;
  questions: Question[];
  selectedOptions: AnswerOption[] = [];
  textAnswers: { questionId: string, text: string }[] = [];
  answeredTextIndexes: number[] = [];
  currentQuestionIndex: number = 0;
  progressPercent: number = 0;

  constructor(
    private testsService: TestsService,
    private questionService: QuestionsService,
    private answerOptionService: AnswerOptionsService,
    private userTestResultService: UserTestResultService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.fetchTest(params['id']);
      }
    });
  }

  fetchTest(testId: string) {
    this.testsService.getById(testId).subscribe({
      next: (test: Test) => {
        this.test = test;
        this.fetchQuestions(testId);
      },
      error: (err) => {
        this.toastr.error(err);
        this.loading = false;
      }
    });
  }

  fetchQuestions(testId: string) {
    this.questionService.fetch(testId).subscribe({
      next: (questions: Question[]) => {
        this.questions = questions;
        this.fetchAnswerOptions();
      },
      error: (err) => {
        this.toastr.error(err);
        this.loading = false;
      }
    });
  }

  fetchAnswerOptions() {
    if (!this.questions) {
      this.loading = false;
      return;
    }
    const requests = this.questions.map((question) => {
      if (question._id) {
        return this.answerOptionService.fetch(question._id).subscribe({
          next: (answerOptions: AnswerOption[]) => {
            question.answerOptionsObj = answerOptions;
          },
          error: (err) => {
            this.toastr.error(err);
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        return null;
      }
    });
    Promise.all(requests).finally(() => {
      this.loading = false;
    });
  }

  onOptionSelect(option: AnswerOption, index: number) {
    if (!this.selectedOptions[index]) {
      this.currentQuestionIndex += 1;
      this.updateProgress();
    }
    this.selectedOptions[index] = option;
  }

  onTextAnswerChange(event: Event, questionId: string | undefined, index: number): void {
    if (!this.answeredTextIndexes.includes(index)) {
      this.currentQuestionIndex += 1;
      this.answeredTextIndexes.push(index);
      this.updateProgress();
    }
    const newText = (event.target as HTMLInputElement).value;
    if (questionId !== undefined) {
      this.textAnswers[index] = {questionId, text: newText};
    }
  }

  updateProgress() {
    this.progressPercent = (this.currentQuestionIndex / this.questions.length) * 100;
  }

  onSubmit() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.toastr.info('Будь ласка, дайте відповіді на всі питання');
      return;
    }

    switch (this.test.processingType) {
      case 'one':
        this.processOneType();
        break;
      case 'many':
        this.processManyType();
        break;
      case 'category':
        this.processCategoryType();
        break;
      case 'self':
        this.processSelfType();
        break;
      default:
        this.toastr.error('Невідомий тип обробки тесту');
    }
  }

  processAnswers() {
    const answers: any[] = [];
    const resultsMap: { [key: string]: number } = {};
    console.log('2')
    this.selectedOptions.forEach((selectedOption) => {
      if (selectedOption) {
        answers.push(selectedOption._id);
        if (selectedOption.possibleResultId && selectedOption.score !== undefined) {
          resultsMap[selectedOption.possibleResultId] =
            (resultsMap[selectedOption.possibleResultId] || 0) + selectedOption.score;
        }
      }
    });

    this.textAnswers.forEach((textAnswer) => {
      this.questions.forEach((question) => {
        const id = question._id;
        if (id != undefined) {
          if (textAnswer.questionId === id) {
            question.answerOptionsObj?.forEach((option) => {
              if (option.text.toLowerCase() === textAnswer.text.toLowerCase()) {
                answers.push(option._id);
                if (option.possibleResultId && option.score !== undefined) {
                  resultsMap[option.possibleResultId] =
                    (resultsMap[option.possibleResultId] || 0) + option.score;
                }
              }
            });
          }
        }
      });
    });

    return {answers, resultsMap};
  }

  createUserTestResult(testScore: number, results: Result[], answers: any[]) {
    const newUserTestResult: UserTestResult = {
      test: this.test._id,
      score: testScore,
      results: results.length ? results : undefined,
      answers: answers,
      textAnswers: this.test.processingType === 'self' ? this.textAnswers : undefined,
    };

    this.userTestResultService.create(newUserTestResult).subscribe({
      next: (response) => {
        this.router.navigate([`/result/${response._id}`]);
      },
      error: (errorResponse) => {
        this.toastr.error(errorResponse.error);
      }
    });
  }

  processOneType() {
    const {answers} = this.processAnswers();
    let testScore = answers.reduce((score, answerId) => {
      const option = this.selectedOptions.find(opt => opt._id === answerId);
      return score + (option?.score || 0);
    }, 0);

    this.createUserTestResult(testScore, [], answers);
  }

  processManyType() {
    const {answers, resultsMap} = this.processAnswers();
    const results = Object.entries(resultsMap).map(([possibleResultId, score]) => ({
      _id: possibleResultId, score
    }));

    this.createUserTestResult(0, results, answers);
  }

  processCategoryType() {
    const {answers, resultsMap} = this.processAnswers();
    const results: Result[] = [];
    let testScore = 0;

    // Create results array
    Object.entries(resultsMap).forEach(([possibleResultId, score]) => {
      testScore += score
      results.push({_id: possibleResultId, score});
    });

    // Create and submit the test result
    this.createUserTestResult(testScore, results, answers);
  }

  processSelfType() {
    const {answers} = this.processAnswers();
    this.createUserTestResult(0, [], answers);
  }
}
