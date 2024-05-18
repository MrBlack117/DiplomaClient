import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Message, Test, UserTestResult} from "../interfaces";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class TestsService {
  constructor(private http: HttpClient) {
  }

  fetch(): Observable<Test[]> {
    return this.http.get<Test[]>('/api/test')
  }

  getById(id: string): Observable<Test> {
    return this.http.get<Test>(`/api/test/${id}`)
  }

  getByUser(): Observable<Test[]> {
    return this.http.get<Test[]>(`/api/test/user`)
  }

  create(name: string, brief: string, description: string, processingType: string, image?: File) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('brief', brief);
    fd.append('description', description);
    fd.append('processingType', processingType)

    return this.http.post<Test>(`/api/test`, fd)
  }

  update(id: string, name: string, brief: string, description: string,  processingType: string, image?: File) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('brief', brief);
    fd.append('description', description);
    fd.append('processingType', processingType)

    return this.http.patch<Test>(`/api/test/${id}`, fd)
  }

  delete(id: string | undefined): Observable<Message> {
    return this.http.delete<Message>(`/api/test/${id}`)
  }

  addReaction(id: string, reaction: string): Observable<Message>{
   return this.http.post<Message>(`/api/test/reaction/${id}`, {reaction: reaction})
  }
}
