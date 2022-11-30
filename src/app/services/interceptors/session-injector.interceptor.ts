import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private oConstantsService: ConstantsService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //Session Token taken from ConstantsService
    const token = this.oConstantsService.getSessionId();
    //Should check that the request is not Login before applying headers

    //If token doesn't exist - go to login page
    if(!token) {
      this.router.navigateByUrl('')
    }
    
    //Apply session token header
    request = request.clone({
      setHeaders: {
        'x-session-token': token
      }
    });
    

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if(event.status === 200) {
            console.log(event)
            //add token to local storage: 

          }
        }
      })
    )

  }
}
