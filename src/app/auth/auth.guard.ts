import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public oAuthService: AuthService, private m_oConstantsService: ConstantsService, private m_oKeycloakService: KeycloakService, private oRouter: Router) { }

  canActivate(): boolean {
    if (!this.oAuthService.getTokenObject()?.access_token) {
      this.oRouter.navigate(["login"])
      return false;
    }
    // If the User isn't set in the constants service
    if (!this.m_oConstantsService.getUser().userId) {
      this.oRouter.navigate(["login"])
      return false;
    }
    return true;
  }

}
