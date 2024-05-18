import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AnswerOption, Message, Question} from "../interfaces";

@Injectable({
  providedIn: 'root',
})

export class AnswerOptionsService {
  constructor(private http: HttpClient) {
  }

  fetch(questionId: string): Observable<AnswerOption[]> {
    return this.http.get<AnswerOption[]>(`/api/answerOption/question/${questionId}`)
  }

  getById(id: string): Observable<AnswerOption> {
    return this.http.get<AnswerOption>(`/api/answerOption/${id}`)
  }

  create(text: string, questionId: string, possibleResultId: string, score: number, image?: File): Observable<AnswerOption> {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    if(possibleResultId){
      fd.append('possibleResultId', possibleResultId);
    }

    if(score){
      fd.append('score', score.toString());
    }

    fd.append('text', text);
    fd.append('questionId', questionId);

    return this.http.post<AnswerOption>(`/api/answerOption`, fd)
  }

  update(id: string, text: string, questionId: string, possibleResultId: string, score: number, image?: File): Observable<AnswerOption> {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    if(possibleResultId){
      fd.append('possibleResultId', possibleResultId);
    }

    if(score){
      fd.append('score', score.toString());
    }

    fd.append('text', text);
    fd.append('questionId', questionId);


    return this.http.patch<AnswerOption>(`/api/answerOption/${id}`, fd)
  }

  delete(AnswerOption: AnswerOption): Observable<Message> {
    return this.http.delete<Message>(`/api/answerOption/${AnswerOption._id}`)
  }
}
