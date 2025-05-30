import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';
import { ConfigurationService } from 'src/app/services/configuration.service';

import { MatDialog } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-login-coplac',
  templateUrl: './login-coplac.component.html',
  styleUrls: ['./login-coplac.component.css'],
  host: { 'class': 'flex-fill' }
})
export class LoginCoplacComponent {
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
    private m_oConfigurationService: ConfigurationService,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService,
    private m_oJwtService: JwtHelperService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_oKeycloak = this.m_oKeycloakService.getKeycloakInstance();
    this.checkKeycloakAuthStatus(this);
    //Subscribe to Keycloak Events

  }

  login(): void {
    const { username, password } = this.form;
    let oLoginInfo = {
      userId: this.form.username,
      userPassword: this.form.password,
      skin: "coplac"
    }
    
    this.m_oConstantsService.setUser({} as User);
    this.m_oAuthService.legacyLogin(oLoginInfo).subscribe((oResponse => {
      if (oResponse.sessionId) {
        this.callbackLogin(oResponse, this)
      } else {
        this.m_oNotificationDisplayService.openAlertDialog("Could not complete login.<br>Please ensure both email and password are correct.", "", 'danger')
      }
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
      // Use a default skin for Coplac login
      oUser.skin = "coplac"; 

      //Set User and Cookie:
      this.m_oConstantsService.setUser(oUser);
      this.m_oAuthService.saveToken(m_oData.sessionId);

      this.m_oAuthService.getSkin(oUser.skin).subscribe({
        next: oResponse => { 
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            //oController.m_oNotificationDisplayService.openAlertDialog("Could not load skin", "", 'danger')
            console.log("LoginComponent.callbackLogin: Skin is null or undefined");
          } 
          else {
            oResponse["bLoadedFromServer"] = true;
            oController.m_oConstantsService.setSkin(oResponse);
            const m_oCurrentSkin = this.m_oConstantsService.getSkin();
            var sBrandMainColor = m_oCurrentSkin.brandMainColor;
            var sBrandSecondaryColor = m_oCurrentSkin.brandSecondaryColor;
            document.documentElement.style.setProperty('--neutral50Brand',  sBrandMainColor);
            document.documentElement.style.setProperty('--wasdiGreen',  sBrandSecondaryColor);
          }
        },
        error: oError => {
          oController.m_oNotificationDisplayService.openAlertDialog("Could not load skin", "", 'danger')
        }
      });

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
    let sHost = window.location.hostname;
    let sTheme = 'wasdi';
    if (sHost.startsWith('coplac')) {
      sTheme = 'keycloak'; // Force standard Keycloak theme for coplac
      // // If your Keycloak service supports passing extra params:
      // if (typeof this.m_oKeycloakService.register === 'function') {
      //   this.m_oKeycloakService.register({ kc_theme: sTheme });
      // } 
      // else {
      //   // Fallback: manually build the registration URL
      // }    
      const sRegisterUrl = this.m_oKeycloak.createRegisterUrl() + `&kc_theme=${sTheme}`;
      window.location.href = sRegisterUrl;

    }
    else {
      this.m_oKeycloakService.register();
    }
  }

  setUsernameInput(oEvent) {
    this.form.username = oEvent.event.target.value;
  }

  setPasswordInput(oEvent) {
    this.form.password = oEvent.event.target.value;
  }

  resetPassword() {

    var sMessage = "Password recovery is executed through our Keycloak portal. Press 'Yes' to continue."
    this.m_oNotificationDisplayService.openConfirmationDialog(sMessage, '', 'alert').subscribe(bResult => {
      if (bResult) {
        this.keycloakLogin()
      }
    })
    return true;
  }
}
