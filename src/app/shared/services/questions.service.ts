import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, Question} from "../interfaces";

@Injectable(
  {
    providedIn: "root",
  }
)

export class QuestionsService {
  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`/api/question/${testId}`)
  }

  create(text: string, testId: string, image?: File): Observable<Question> {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('text', text);
    fd.append('testId', testId);

    return this.http.post<Question>('/api/question', fd)
  }

  update(id: string, text: string, testId: string, image?: File): Observable<Question> {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('text', text);
    fd.append('testId', testId);

    return this.http.patch<Question>(`/api/question/${id}`, fd)
  }

  delete(Question: Question): Observable<Message> {
    return this.http.delete<Message>(`/api/question/${Question._id}`)
  }
}
