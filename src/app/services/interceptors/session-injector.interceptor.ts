import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, from, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from '../constants.service';
import { User } from 'src/app/shared/models/user.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class SessionInjectorInterceptor implements HttpInterceptor {

  constructor(private m_oRouter: Router, private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService, private m_oAuthService: AuthService) { }

  intercept(oRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.m_oKeycloakService.isLoggedIn()) {
      return from(this.refreshKeycloakToken()).pipe(
        switchMap(() => this.injectAuthorizationHeader(oRequest, next)),
        catchError(() => {
          this.m_oRouter.navigateByUrl('login');
          return this.injectAuthorizationHeader(oRequest, next);
        })
      );
    }

    if (this.isJwtTokenExpiringSoon()) {
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

  private async refreshKeycloakToken(): Promise<void> {
    await this.m_oKeycloakService.updateToken(30);

    const oKeycloak = this.m_oKeycloakService.getKeycloakInstance();
    if (!oKeycloak.token) {
      return;
    }

    localStorage.setItem('access_token', oKeycloak.token);
    if (oKeycloak.refreshToken) {
      localStorage.setItem('refresh_token', oKeycloak.refreshToken);
    }

    const oUser = this.m_oConstantsService.getUser();
    oUser.sessionId = oKeycloak.token;
    oUser.refreshToken = oKeycloak.refreshToken;
    this.m_oConstantsService.setUser(oUser);
  }

  private isJwtTokenExpiringSoon(): boolean {
    const sAccessToken = this.m_oConstantsService.getSessionId();
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sAccessToken) || (sAccessToken.match(/\./g) || []).length !== 2) {
      return false;
    }

    const oKeycloak = this.m_oKeycloakService.getKeycloakInstance();
    return !oKeycloak.authenticated && oKeycloak.isTokenExpired(30);
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
    oUser.sessionId = oResponse.accessToken;
    oUser.refreshToken = oResponse.refreshToken;
    oUser.expiresIn = oResponse.expiresIn;
    this.m_oConstantsService.setUser(oUser);
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