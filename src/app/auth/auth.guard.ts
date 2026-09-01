import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConstantsService } from '../services/constants.service';
import { AuthService } from './service/auth.service';
import { WorkspaceService } from '../services/api/workspace.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { Title } from '@angular/platform-browser';  


@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(
    public oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService,
    private m_oWorkspaceService: WorkspaceService,
    private oRouter: Router,
    private m_oTitleService: Title
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (!this.oAuthService.getTokenObject()?.access_token || !this.m_oConstantsService.getUser().userId) {
      return of(this.getLoginUrlTree());
    }

    return this.oAuthService.checkSession().pipe(
      map(oResponse => {
        if (!oResponse.userId) {
          this.m_oConstantsService.setUser({} as any);
          return this.getLoginUrlTree();
        }

        this.loadSkin(oResponse);
        this.loadLastWorkspace(oResponse);
        return true;
      }),
      catchError(() => {
        this.m_oConstantsService.setUser({} as any);
        return of(this.getLoginUrlTree());
      })
    );
  }

  private getLoginUrlTree(): UrlTree {
    const sHost = window.location.hostname;
    let sRedirectLink = '/login';

    if (sHost.startsWith('coplac') || sHost.startsWith('wasdi.cimh')) {
      sRedirectLink = '/login-coplac';
    }

    return this.oRouter.parseUrl(sRedirectLink);
  }

  private loadSkin(oSessionUser: any): void {
    const oSkin = this.m_oConstantsService.getSkin();
    if (oSkin.bLoadedFromServer) {
      return;
    }

    let sSkin = oSessionUser.skin;
    if (window.location.hostname.startsWith('coplac')) {
      sSkin = 'coplac';
    }

    this.oAuthService.getSkin(sSkin).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          return;
        }

        oResponse["bLoadedFromServer"] = true;
        this.m_oConstantsService.setSkin(oResponse);
        const oCurrentSkin = this.m_oConstantsService.getSkin();
        document.documentElement.style.setProperty('--neutral50Brand', oCurrentSkin.brandMainColor);
        document.documentElement.style.setProperty('--wasdiGreen', oCurrentSkin.brandSecondaryColor);
        if (oCurrentSkin.logoText.includes('coplac')) {
          let oLink: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!oLink) {
            oLink = document.createElement('link');
            oLink.type = 'image/x-icon';
            oLink.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(oLink);
          }
          oLink.href = 'assets/icons/favicon-coplac.ico';
          this.m_oTitleService.setTitle('Copernicus LAC');
        }
      }
    });
  }

  /**
   * Store the last workspace ID if no active workspace is set
   * The actual workspace will be loaded by the editor component when needed
   * @param oUser User object from the session check response
   */
  private loadLastWorkspace(oUser: any): void {
    // Only store lastWorkspace ID if active workspace is not set
    const oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oActiveWorkspace) || !oActiveWorkspace.workspaceId) &&
        oUser && oUser.lastWorkspace && oUser.lastWorkspace.trim() !== '') {
      // Store the ID for later loading in the editor
      this.m_oConstantsService.setLastWorkspaceId(oUser.lastWorkspace);
    }
  }
}
