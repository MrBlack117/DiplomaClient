import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Message, Test} from "../interfaces";
import {Observable} from "rxjs";
import {environment} from "../../../enviroments/enviroment";

@Injectable({
  providedIn: 'root'
})

export class TestsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetch(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/api/test`)
  }

  getById(id: string): Observable<Test> {
    return this.http.get<Test>(`${this.apiUrl}/api/test/${id}`)
  }

  getByUser(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/api/test/user`)
  }

  create(name: string, brief: string, description: string, image?: File) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('brief', brief);
    fd.append('description', description);

    return this.http.post<Test>(`${this.apiUrl}/api/test`, fd)
  }

  update(id: string, name: string, brief: string, description: string, image?: File) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('brief', brief);
    fd.append('description', description);

    return this.http.patch<Test>(`${this.apiUrl}/api/test/${id}`, fd)
  }

  delete(id: string | undefined): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/test/${id}`)
  }

  addReaction(id: string, reaction: string): Observable<Message>{
   return this.http.post<Message>(`${this.apiUrl}/api/test/reaction/${id}`, {reaction: reaction})
  }
}
