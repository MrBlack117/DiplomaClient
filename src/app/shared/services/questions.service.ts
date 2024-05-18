import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, Question} from "../interfaces";
import {environment} from "../../../environments/environment";

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

  create(text: string, testId: string, image?: File): Observable<Question> {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('text', text);
    fd.append('testId', testId);

    return this.http.post<Question>(`${this.apiUrl}/api/question`, fd)
  }

  update(id: string, text: string, testId: string, image?: File): Observable<Question> {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('text', text);
    fd.append('testId', testId);

    return this.http.patch<Question>(`${this.apiUrl}/api/question/${id}`, fd)
  }

  delete(Question: Question): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/question/${Question._id}`)
  }
}
