import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, PossibleResult, Test} from "../interfaces";
import {environment} from "../../../enviroments/enviroment";


@Injectable(
  {
    providedIn: "root",
  }
)

export class PossibleResultsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<PossibleResult[]> {
    return this.http.get<PossibleResult[]>(`${this.apiUrl}/api/possibleResult/test/${testId}`)
  }

  get(id: string): Observable<PossibleResult> {
    return this.http.get<PossibleResult>(`${this.apiUrl}/api/possibleResult/${id}`)
  }

  create(name: string, description: string, testId: string, image?: File, ) {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('description', description);
    fd.append('testId', testId);

    return this.http.post<PossibleResult>(`${this.apiUrl}/api/possibleResult`, fd)
  }

  update(id: string, name: string, description: string, testId: string, image?: File) {
    const fd = new FormData();

    if (image){
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('description', description);
    fd.append('testId', testId)

    return  this.http.patch<PossibleResult>(`${this.apiUrl}/api/possibleResult/${id}`, fd)
  }

  delete(possibleResult: PossibleResult): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/api/possibleResult/${possibleResult._id}`)
  }
}
