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
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private m_oRouter: Router, private m_oConstantsService: ConstantsService) { }

  intercept(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Session Token taken from ConstantsService
    const oCookie = this.m_oConstantsService.getCookie('oUser');
    const sToken = this.m_oConstantsService.getSessionId();
    const oUser = this.m_oConstantsService.getUser();
    if (!oUser.userId) {
      this.m_oRouter.navigateByUrl('login');
    }

    // If token doesn't exist - go to login page
    if (!sToken && !oCookie) {
      this.m_oRouter.navigateByUrl('login')
    }

    if (!FadeoutUtils.utilsIsStrNullOrEmpty(sToken)) {
      oRequest = oRequest.clone({
        setHeaders: {
          'x-session-token': sToken
        }
      });  
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oCookie.sessionId)) {
      //Safeguard in case sessionId only in Cookie
      oRequest = oRequest.clone({
        setHeaders: { 'x-session-token': oCookie.sessionId }
      });
    }
    
    return next.handle(oRequest).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {

          }
        }
      })
    )
  }
}