import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, Question} from "../interfaces";
import {environment} from "../../../enviroments/enviroment";


@Injectable(
  {
    providedIn: "root",
  }
)

export class QuestionsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/api/question/${testId}`)
  }

  create(Question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/api/question`, Question)
  }

  update(Question: Question): Observable<Question> {
    return this.http.patch<Question>(`${this.apiUrl}/api/question/${Question._id}`, Question)
  }

  delete(Question: Question): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/question/${Question._id}`)
  }
}
