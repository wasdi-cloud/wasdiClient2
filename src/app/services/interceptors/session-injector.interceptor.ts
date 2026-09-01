import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, from, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from '../constants.service';
import { User } from 'src/app/shared/models/user.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private m_oRouter: Router, private m_oConstantsService: ConstantsService,
    private m_oAuthService: AuthService, private m_oJwtService: JwtHelperService) { }

  intercept(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isAccessTokenExpiringSoon()) {
      return from(this.refreshPasswordGrantToken()).pipe(
        switchMap(() => this.injectAuthorizationHeader(oRequest, next)),
        catchError(() => {
          this.m_oRouter.navigateByUrl('login');
          return EMPTY;
        })
      );
    }

    return this.injectAuthorizationHeader(oRequest, next);
  }

  private injectAuthorizationHeader(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const oUser = this.m_oConstantsService.getUser();
    const sAuthorizationHeader = this.m_oConstantsService.getAuthorizationHeaderValue();
    if (!oUser.userId || FadeoutUtils.utilsIsStrNullOrEmpty(sAuthorizationHeader)) {
      this.m_oRouter.navigateByUrl('login');
      return EMPTY;
    }

    oRequest = oRequest.clone({
      setHeaders: { 'Authorization': sAuthorizationHeader }
    });
    
    return next.handle(oRequest).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {

          }
        }
      })
    )
  }

  private isAccessTokenExpiringSoon(): boolean {
    const sAccessToken = this.m_oConstantsService.getUser().accessToken;
    return !FadeoutUtils.utilsIsStrNullOrEmpty(sAccessToken) && this.m_oJwtService.isTokenExpired(sAccessToken, 30);
  }

  private async refreshPasswordGrantToken(): Promise<void> {
    const oUser = this.m_oConstantsService.getUser();
    const sRefreshToken = oUser.refreshToken || localStorage.getItem('refresh_token');
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sRefreshToken)) {
      throw new Error('Missing Keycloak refresh token');
    }

    const oResponse = await new Promise<any>((resolve, reject) => {
      this.m_oAuthService.refreshToken(sRefreshToken).subscribe({ next: resolve, error: reject });
    });

    if (FadeoutUtils.utilsIsStrNullOrEmpty(oResponse.accessToken) || FadeoutUtils.utilsIsStrNullOrEmpty(oResponse.refreshToken)) {
      throw new Error('Invalid Keycloak refresh response');
    }

    localStorage.setItem('access_token', oResponse.accessToken);
    localStorage.setItem('refresh_token', oResponse.refreshToken);
    oUser.accessToken = oResponse.accessToken;
    oUser.refreshToken = oResponse.refreshToken;
    oUser.expiresIn = oResponse.expiresIn;
    this.m_oConstantsService.setUser(oUser);
  }

}