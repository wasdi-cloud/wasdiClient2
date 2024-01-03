import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';

import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent, ErrorDialogModel } from 'src/app/shared/dialogs/error-dialog/error-dialog.component';
import { KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from 'src/app/init/keycloak-init.factory';

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

  constructor(
    private m_oAuthService: AuthService,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oKeycloakService: KeycloakService,
    private m_oRouter: Router) { }

  ngOnInit(): void {
    this.checkKeycloakAuthStatus(this);
    console.log(initializeKeycloak);
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
    if (this.m_oKeycloakService.isLoggedIn) {
      if (this.m_oKeycloakService.getToken()) {
        console.log(this.m_oKeycloakService.getToken());
        console.log(this.m_oKeycloakService.getKeycloakInstance())
      }
    }
  }

  /**
   * Handle the answer of the Login Service
   * @param data 
   * @param oController 
   */
  callbackLogin(data: User, oController: this) {

    if (!oController) {
      oController = this;
    }

    // We need sessionId
    if (data.hasOwnProperty("sessionId")) {
      if (data.sessionId == null) {
        // If it is null, the login failed
        let oDialogData = new ErrorDialogModel("Error logging in.", "Please check Email and Password");
        let dialogRef = this.m_oDialog.open(ErrorDialogComponent, {
          maxWidth: "400px",
          data: oDialogData
        })
      }
      else {
        // Ok we have a valid session Id
        let oUser = {} as User;
        oUser.userId = data.userId;
        oUser.authProvider = 'wasdi';
        oUser.name = data.name;
        oUser.surname = data.surname;
        oUser.sessionId = data.sessionId;
        oUser.role = data.role;
        oUser.type = data.type;
        oUser.grantedAuthorities = data.grantedAuthorities;

        //set user and cookie
        this.m_oConstantsService.setUser(oUser);
        this.m_oAuthService.saveToken(data.sessionId);

        this.m_oAuthService.checkSession().subscribe({
          next: oResponse => {
            oController.m_oRouter.navigateByUrl('/marketplace');
          }
        })

      }
    }
  }

  keycloakLogin() {
    this.m_oKeycloakService.login();
  }

  keycloakRegister() {
    this.m_oKeycloakService.register();
  }
}
