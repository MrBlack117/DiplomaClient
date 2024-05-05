import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AnswerOption, Message, Question} from "../interfaces";
import {environment} from "../../../enviroments/enviroment";


@Injectable({
    providedIn: 'root',
  })

export class AnswerOptionsService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetch(questionId: string): Observable<AnswerOption[]> {
    return this.http.get<AnswerOption[]>(`${this.apiUrl}/api/answerOption/question/${questionId}`)
  }

  getById(id: string): Observable<AnswerOption> {
    return this.http.get<AnswerOption>(`${this.apiUrl}/api/answerOption/${id}`)
  }

  create(AnswerOption: AnswerOption): Observable<AnswerOption> {
    return this.http.post<AnswerOption>(`${this.apiUrl}/api/answerOption`, AnswerOption)
  }

  update(AnswerOption: AnswerOption): Observable<AnswerOption> {
    return this.http.patch<AnswerOption>(`${this.apiUrl}/api/answerOption/${AnswerOption._id}`, AnswerOption)
  }

  delete(AnswerOption: AnswerOption): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/answerOption/${AnswerOption._id}`)
  }
}
