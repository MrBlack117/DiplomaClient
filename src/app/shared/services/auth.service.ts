import {Injectable} from "@angular/core";
import {User} from "../interfaces";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {environment} from "../../../enviroments/enviroment";


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private token: string = ''
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getUserData(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/auth/user/${userId}`)
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/auth/register`, user)
  }

  login(user: User): Observable<{ token: string }> {
    return this.http.post<{ token: string, userData:object }>(`${this.apiUrl}/api/auth/login`, user)
      .pipe(
        tap(({token, userData}) => {
          localStorage.setItem("auth-token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          this.setToken(token);
        })
      );
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
