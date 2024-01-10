import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';

import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent, ErrorDialogModel } from 'src/app/shared/dialogs/error-dialog/error-dialog.component';
import { KeycloakService } from 'keycloak-angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  m_bisLoggedIn: boolean = false;
  m_bisLoginFailed: boolean = false;

  m_sErrorMessage: string = '';

  m_oKeycloak: any = null;

  constructor(
    //  @Inject(Keycloak) private m_oKeycloak: any,
    private m_oAuthService: AuthService,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService,
    private m_oJwtService: JwtHelperService,
    private m_oRouter: Router) { }

  ngOnInit(): void {
    this.m_oKeycloak = this.m_oKeycloakService.getKeycloakInstance();
    this.checkKeycloakAuthStatus(this);
    //Subscribe to Keycloak Events

  }

  login(): void {
    const { username, password } = this.form;
    let oLoginInfo = {
      userId: this.form.username,
      userPassword: this.form.password
    }
    this.m_oConstantsService.setUser({} as User);
    this.m_oAuthService.legacyLogin(oLoginInfo).subscribe((oResponse => {
      this.callbackLogin(oResponse, this)
    }))
  }

  checkKeycloakAuthStatus(oController) {
    if (this.m_oKeycloak.authenticated) {
      if (this.m_oKeycloak.idToken) {
        const aoDataTokens = {
          'access_token': this.m_oKeycloak.idToken,
          'refresh_token': this.m_oKeycloak.refreshToken
        }

        this.callbackLogin(aoDataTokens, null);
      } else {
        console.log("LoginComponent.checkKeycloakAuthStatus: Not Authenticated")
      }
    }
  }

  /**
   * Handle the answer of the Login Service
   * @param data 
   * @param oController 
   */
  callbackLogin(m_oData: any, oController: this) {

    //Ensure controller is defined: 
    if (!oController) {
      oController = this;
    }

    let oUser = {} as User;
    //If the user logs in with legacy login:
    if (m_oData.hasOwnProperty("sessionId")) {
      oUser.userId = m_oData.userId;
      oUser.authProvider = 'wasdi';
      oUser.name = m_oData.name;
      oUser.surname = m_oData.surname;
      oUser.sessionId = m_oData.sessionId;
      oUser.role = m_oData.role;
      oUser.type = m_oData.type;
      oUser.grantedAuthorities = m_oData.grantedAuthorities;

      //Set User and Cookie:
      this.m_oConstantsService.setUser(oUser);
      this.m_oAuthService.saveToken(m_oData.sessionId);
      oController.m_oRouter.navigateByUrl('/marketplace');
    } else {
      window.localStorage["access_token"] = m_oData['access_token'];
      window.localStorage["refresh_token"] = m_oData['refresh_token'];

      let oDecodedToken = this.m_oJwtService.decodeToken(m_oData["access_token"]);

      oUser.userId = oDecodedToken.preferred_username;
      oUser.name = oDecodedToken.given_name;
      oUser.surname = oDecodedToken.family_name;
      oUser.type = m_oData.type;
      oUser.authProvider = "wasdi";
      oUser.sessionId = m_oData['access_token'];
      oUser["refreshToken"] = m_oData['refresh_token'];

      oController.m_oConstantsService.setUser(oUser);

      this.m_oAuthService.checkSession().subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.type)) {
            oUser.type = oResponse.type;
            oController.m_oConstantsService.setUser(oUser);

          }
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.userId)) {
            oController.m_oRouter.navigateByUrl('/marketplace');
          }
        },
        error: oError => {

        }
      })
    }

  }

  keycloakLogin() {
    this.m_oKeycloakService.login();
  }

  keycloakRegister() {
    this.m_oKeycloakService.register();
  }
}
