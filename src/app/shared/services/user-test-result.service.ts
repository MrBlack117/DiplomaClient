import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, UserTestResult} from "../interfaces";

@Injectable(
  {
    providedIn: "root",
  }
)

export class UserTestResultService {
  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<UserTestResult[]> {
    return this.http.get<UserTestResult[]>(`/api/userTestResult/test/${testId}`)
  }

  getById(id: string): Observable<UserTestResult> {
    return this.http.get<UserTestResult>(`/api/userTestResult/${id}`)
  }

  getByUser(): Observable<UserTestResult[]> {
    return this.http.get<UserTestResult[]>(`/api/userTestResult/user`)
  }

  create(userTestResult: UserTestResult): Observable<UserTestResult> {
    return this.http.post<UserTestResult>('/api/userTestResult', userTestResult)
  }

  update(userTestResult: UserTestResult): Observable<UserTestResult> {
    return this.http.patch<UserTestResult>(`/api/userTestResult/${userTestResult._id}`, userTestResult)
  }

  delete(userTestResult: UserTestResult): Observable<Message> {
    return this.http.delete<Message>(`/api/userTestResult/${userTestResult._id}`)
  }
}
