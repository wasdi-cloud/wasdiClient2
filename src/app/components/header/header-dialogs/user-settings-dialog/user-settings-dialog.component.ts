import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-settings-dialog',
  templateUrl: './user-settings-dialog.component.html',
  styleUrls: ['./user-settings-dialog.component.css']
})
export class UserSettingsDialogComponent {
  faClose = faX;
  m_oUser: User;
  m_oEditPassword = {
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: ""
  }
  m_oEditUser = {
    fname: "",
    lname: "",
    userId: ""
  }

  m_bEditingPassword: boolean;

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oProcessWorkspaceService: ProcessWorkspaceServiceService
  ) {
    this.m_oUser = this.m_oConstantsService.getUser();
    this.m_oEditUser = {
      fname: this.m_oUser.name,
      lname: this.m_oUser.surname,
      userId: this.m_oUser.userId
    }

    this.m_bEditingPassword = false;
    this.getUserAuthProvider();
  }

  getUserAuthProvider() {
    return this.m_oUser.authProvider;
  }

  isUserLoggedInWithGoogle() {
    return ((this.m_oUser.authProvider === "google") ? true : false);
  }

  changePassword() {
    let oJsonToSend = this.getPasswordsJSON();
    console.log(oJsonToSend)

    // this.m_bEditingPassword = true;
    // this.m_oAuthService.changePassword(oJsonToSend).subscribe(oResponse => {
    //   console.log(oResponse)
    // })
  }

  changeUserInfo() {
    console.log(this.m_oEditUser)
  }

  getPasswordsJSON() {
    return {
      newPassword: this.m_oEditPassword.newPassword,
      currentPassword: this.m_oEditPassword.currentPassword
    }
  }

  getUserInfo() {

  }

  cleanPasswordsInEditUserObject() {

  }

  cleanInfoInEditUserObject() {

  }

  initalizeEditUserInfo() {

  }

  initalizeUerRuntimeInfo() {

  }

  dismiss(event: MouseEvent) {
    this.m_oDialog.closeAll();
  }
}
