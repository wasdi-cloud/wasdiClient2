import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstantsService } from '../constants.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public oAuthService: AuthService, private oConstantsService: ConstantsService, private oRouter: Router) {}

  canActivate(): boolean {
    if(!this.oAuthService.getTokenObject()?.access_token) {
      this.oRouter.navigate(["login"])
      return false;
    }
    return true;
  }
  
}
