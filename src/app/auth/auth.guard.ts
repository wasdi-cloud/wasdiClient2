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
import { Observable, map } from 'rxjs';
import { User } from '../shared/models/user.model';

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
          return true;
        } else {
          this.m_oConstantsService.setUser(oResponse);
          this.oRouter.navigate(['login']);
          return false;
        }
      },
    });
    if (!this.oAuthService.getTokenObject()?.access_token) {
      this.oRouter.navigate(['login']);
      return false;
    }
    // If the User isn't set in the constants service
    if (!this.m_oConstantsService.getUser().userId) {
      this.oRouter.navigate(['login']);
      return false;
    }
    return true;
  }
}
