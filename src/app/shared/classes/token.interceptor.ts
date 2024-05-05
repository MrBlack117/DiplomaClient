import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {catchError, throwError} from "rxjs";
import {Router} from "@angular/router";
import {inject} from "@angular/core";

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)

  let token = localStorage.getItem("auth-token");
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: token
      }
    })
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if(error.status === 401){
        router.navigateByUrl("/auth");
      }
      return throwError(() => error);
    })
  );


}
