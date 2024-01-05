import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public oAuthService: AuthService, private oConstantsService: ConstantsService, private m_oKeycloakService: KeycloakService, private oRouter: Router) { }

  canActivate(): boolean {
    console.log("Hello")
    console.log(this.oAuthService.getTokenObject().access_token)
    if (!this.oAuthService.getTokenObject()?.access_token) {
      this.oRouter.navigate(["login"])
      return false;
    }
    return true;
  }

}
