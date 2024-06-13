import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstantsService } from '../services/constants.service';

@Injectable({
  providedIn: 'root'
})
export class IsSignedInGuard implements CanActivate {
  constructor(private m_oConstantsService: ConstantsService, private m_oRouter: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.m_oConstantsService.getUser().userId) {
        this.m_oRouter.navigate(["marketplace"]); // or home
        return false;
      }
      return true;
  }
  
}
