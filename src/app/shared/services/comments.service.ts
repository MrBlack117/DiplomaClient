import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Comment, Message} from "../interfaces";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})


export class CommentsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }


  fetch(testId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/api/comment/test/${testId}`)
  }

  getById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/api/comment/${id}`)
  }

  create(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/api/comment`, comment)
  }

  update(comment: Comment): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/api/comment/${comment._id}`, comment)
  }

  delete(comment: Comment): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/comment/${comment._id}`)
  }

}
