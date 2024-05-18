import {Injectable} from "@angular/core";
import {User} from "../interfaces";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private token: string = ''

  constructor(private http: HttpClient) {
  }

  getUserData(userId: string): Observable<User> {
    return this.http.get<User>(`/api/auth/user/${userId}`)
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`/api/auth/user/email/${email}`)
  }

  register(user: User): Observable<{ result: object, token: string }> {
    return this.http.post<{ result: object, token: string, userData: object }>('/api/auth/register', user).pipe(
      tap(({token, userData}) => {
        localStorage.setItem("auth-token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        this.setToken(token);
      })
    );
  }

  login(user: User): Observable<{ token: string }> {
    return this.http.post<{ token: string, userData: object }>('/api/auth/login', user)
      .pipe(
        tap(({token, userData}) => {
          localStorage.setItem("auth-token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          this.setToken(token);
        })
      );
  }

  googleAuth(email: string, name: string) {
    return this.http.post<{ token: string, userData: object }>('/api/auth/googleAuth', {email: email, name: name}).pipe(
      tap(({token, userData}) => {
        localStorage.setItem("auth-token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        this.setToken(token);
      })
    )
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout() {
    this.setToken('');
    localStorage.removeItem("auth-token");
  }
}
