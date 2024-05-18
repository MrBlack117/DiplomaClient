import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Comment, Message} from "../interfaces";


@Injectable({
  providedIn: 'root'
})


export class CommentsService {
  constructor(private http: HttpClient) {
  }


  fetch(testId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/comment/test/${testId}`)
  }

  getById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`/api/comment/${id}`)
  }

  create(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`/api/comment`, comment)
  }

  update(comment: Comment): Observable<Comment> {
    return this.http.patch<Comment>(`/api/comment/${comment._id}`, comment)
  }

  delete(comment: Comment): Observable<Message> {
    return this.http.delete<Message>(`/api/comment/${comment._id}`)
  }

}
