import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, UserTestResult} from "../interfaces";
import {environment} from "../../../environments/environment";

@Injectable(
  {
    providedIn: "root",
  }
)

export class UserTestResultService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<UserTestResult[]> {
    return this.http.get<UserTestResult[]>(`${this.apiUrl}/api/userTestResult/test/${testId}`)
  }

  getById(id: string): Observable<UserTestResult> {
    return this.http.get<UserTestResult>(`${this.apiUrl}/api/userTestResult/${id}`)
  }

  getByUser(): Observable<UserTestResult[]> {
    return this.http.get<UserTestResult[]>(`${this.apiUrl}/api/userTestResult/user`)
  }

  create(userTestResult: UserTestResult): Observable<UserTestResult> {
    return this.http.post<UserTestResult>(`${this.apiUrl}/api/userTestResult`, userTestResult)
  }

  update(userTestResult: UserTestResult): Observable<UserTestResult> {
    return this.http.patch<UserTestResult>(`${this.apiUrl}/api/userTestResult/${userTestResult._id}`, userTestResult)
  }

  delete(userTestResult: UserTestResult): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/userTestResult/${userTestResult._id}`)
  }
}
