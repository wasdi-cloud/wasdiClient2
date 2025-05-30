import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from './service/auth.service';
import { Observable } from 'rxjs';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    public oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService,
    private oRouter: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.oAuthService.checkSession().subscribe({
      next: (oResponse) => {
        if (oResponse.userId) {
          let oSkin = this.m_oConstantsService.getSkin();

          if (!oSkin.bLoadedFromServer) {

            let sSkin = oResponse.skin;

            const sHost = window.location.hostname;
            if (sHost.startsWith('coplac')) {
              sSkin = 'coplac';
            }            

            this.oAuthService.getSkin(sSkin).subscribe({
              next: oResponse => { 
                if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
                  console.error("LoginComponent.callbackLogin: Skin is null or undefined");
                } 
                else {
                  oResponse["bLoadedFromServer"] = true;
                  this.m_oConstantsService.setSkin(oResponse);
                  const m_oCurrentSkin = this.m_oConstantsService.getSkin();
                  var sBrandMainColor = m_oCurrentSkin.brandMainColor;
                  var sBrandSecondaryColor = m_oCurrentSkin.brandSecondaryColor;
                  document.documentElement.style.setProperty('--neutral50Brand',  sBrandMainColor);
                  document.documentElement.style.setProperty('--wasdiGreen',  sBrandSecondaryColor);
                }
              },
              error: oError => {
                //oController.m_oNotificationDisplayService.openAlertDialog("Could not load skin", "", 'danger')
              }
            });            
          }

          return true;
        } 
        else {
          this.m_oConstantsService.setUser(oResponse);
          this.redirectToLogin();
          return false;
        }
      },
    });
    if (!this.oAuthService.getTokenObject()?.access_token) {
      this.redirectToLogin();
      return false;
    }
    // If the User isn't set in the constants service
    if (!this.m_oConstantsService.getUser().userId) {
      this.redirectToLogin();
      return false;
    }
    return true;
  }

  redirectToLogin() {

    const sHost = window.location.hostname;
    let sRedirectLink = '/login';
    
    if (sHost.startsWith('coplac')) {
      sRedirectLink = '/login-coplac';
    }

    this.oRouter.navigate([sRedirectLink]);
  }
}
