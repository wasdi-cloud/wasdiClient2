import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
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
      // Wrap legacy session token with "wasdi-" prefix for Authorization header
      const sWrappedToken = this.wrapLegacyToken(sToken);
      oRequest = oRequest.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + sWrappedToken
        }
      });  
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oCookie.sessionId)) {
      // Safeguard in case sessionId only in Cookie
      const sWrappedToken = this.wrapLegacyToken(oCookie.sessionId);
      oRequest = oRequest.clone({
        setHeaders: { 'Authorization': 'Bearer ' + sWrappedToken }
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

  /**
   * Wrap legacy WASDI session token with "wasdi-" prefix.
   * Used for Authorization header format: "Bearer wasdi-<sessionId>"
   * 
   * @param sToken Session token
   * @returns Wrapped token or original if already wrapped
   */
  private wrapLegacyToken(sToken: string): string {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sToken)) {
      return sToken;
    }

    // If already wrapped with "wasdi-", return as-is
    if (sToken.startsWith('wasdi-')) {
      return sToken;
    }

    // If it looks like a JWT (has 2 dots), return as-is (Phase 2)
    const iDotCount = (sToken.match(/\./g) || []).length;
    if (iDotCount === 2) {
      return sToken;
    }

    // Otherwise, it's a legacy token - wrap it
    return 'wasdi-' + sToken;
  }
}