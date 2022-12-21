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
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private oConstantsService: ConstantsService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //Session Token taken from ConstantsService
    const cookie = this.oConstantsService.getCookie('oUser');
    const token = this.oConstantsService.getSessionId();

    // // //If token doesn't exist - go to login page
    if (!token && !cookie) {
      this.router.navigateByUrl('login')
    }

    request = request.clone({
      setHeaders: {
        'x-session-token': token
      }
    });

    //Safeguard in case sessionId only in Cookie
    if(!token && cookie.sessionId) {
      request = request.clone({
        setHeaders: {
          'x-session-token': cookie.sessionId
        }
      });
    }
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {
            console.log(event)
          }
        }
      })
    )
  }
}
