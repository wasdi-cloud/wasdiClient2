import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { EMPTY, from, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from '../constants.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private m_oRouter: Router, private m_oConstantsService: ConstantsService,
    private m_oAuthService: AuthService, private m_oJwtService: JwtHelperService) { }

  intercept(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldSkipTokenRefresh(oRequest)) {
      return this.injectAuthorizationHeader(oRequest, next);
    }

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

  private shouldSkipTokenRefresh(oRequest: HttpRequest<any>): boolean {
    const sUrl = oRequest.url.toLowerCase();
    return sUrl.includes('/auth/refresh') || sUrl.includes('/auth/login');
  }

  private injectAuthorizationHeader(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const sAuthorizationHeader = this.m_oConstantsService.getAuthorizationHeaderValue();
    
    // Add authorization header if available; allow unauthenticated requests to proceed
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(sAuthorizationHeader)) {
      oRequest = oRequest.clone({
        setHeaders: { 'Authorization': sAuthorizationHeader }
      });
    }
    
    return next.handle(oRequest);
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