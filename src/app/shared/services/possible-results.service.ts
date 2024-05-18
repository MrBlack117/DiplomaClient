import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Message, PossibleResult, Test} from "../interfaces";

@Injectable(
  {
    providedIn: "root",
  }
)

export class PossibleResultsService {
  constructor(private http: HttpClient) {
  }

  fetch(testId: string): Observable<PossibleResult[]> {
    return this.http.get<PossibleResult[]>(`/api/possibleResult/test/${testId}`)
  }

  get(id: string): Observable<PossibleResult> {
    return this.http.get<PossibleResult>(`/api/possibleResult/${id}`)
  }

  create(name: string, description: string, testId: string, image?: File, maxScore?: number, minScore?: number) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('description', description);
    fd.append('testId', testId);


    if (maxScore) {
      fd.append('maxScore', maxScore.toString())
    }

    if (minScore) {
      fd.append('minScore', minScore.toString())
    }


    return this.http.post<PossibleResult>(`/api/possibleResult`, fd)
  }

  update(id: string, name: string, description: string, testId: string, image?: File, maxScore?: number, minScore?: number) {
    const fd = new FormData();

    if (image) {
      fd.append('image', image, image.name)
    }

    fd.append('name', name);
    fd.append('description', description);
    fd.append('testId', testId)



    if (maxScore) {
      fd.append('maxScore', maxScore.toString())
    }

    if (minScore) {
      fd.append('minScore', minScore.toString())
    }

    return this.http.patch<PossibleResult>(`/api/possibleResult/${id}`, fd)
  }

  delete(possibleResult: PossibleResult): Observable<Message> {
    return this.http.delete<Message>(`/api/possibleResult/${possibleResult._id}`)
  }
}
