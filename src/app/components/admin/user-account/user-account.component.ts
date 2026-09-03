import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { CreditsService } from 'src/app/services/api/credits.service'; 
import { SubscriptionService } from 'src/app/services/api/subscription.service';

import { User } from 'src/app/shared/models/user.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';

@Component({
    selector: 'app-user-account',
    templateUrl: './user-account.component.html',
    styleUrls: ['./user-account.component.css'],
    standalone: false
})
export class UserAccountComponent implements OnInit {
  m_oUser: User = null;
  m_oEditPassword = {
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: ""
  }
  m_oEditUser = {
    fname: "",
    lname: "",
    userId: "",
    publicNickName: ""
  }

  m_aoLanguages = [
    {
      name: 'English',
      value: 'en'
    }, {
      name: 'Español',
      value: 'es'
    }, {
      name: 'Français',
      value: 'fr'
    }, {
      name: 'Italiano',
      value: 'it'
    }, {
      name: 'Deutsch',
      value: 'de'
    }, {
      name: 'Tiếng Việt',
      value: 'vi'
    }, {
      name: 'bahasa Indonesia',
      value: 'id'
    }, {
      name: 'Română',
      value: 'ro'
    }
  ]

  m_bEditingPassword: boolean = false;

  m_bEditingUserInfo: boolean = false;

  m_iCreditsBalance: number = 0;

  m_oActiveSubscription: any;

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService,
    private m_oCreditsService: CreditsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oAdminDashboardService: AdminDashboardService
  ) {
    //Register translation languages:
    m_oTranslate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    m_oTranslate.setDefaultLang('en');
  }


  translateLanguageTo(lang: any) {
    this.m_oTranslate.use(lang.value.value);
  }


  ngOnInit(): void {
    this.m_oUser = this.m_oConstantsService.getUser();
    this.m_oEditUser = {
      fname: this.m_oUser.name,
      lname: this.m_oUser.surname,
      userId: this.m_oUser.userId,
      publicNickName: this.m_oUser.publicNickName
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditUser.publicNickName)) {
      this.m_oEditUser.publicNickName = this.m_oUser.name;
      this.m_oUser.publicNickName = this.m_oUser.name;
    }

    this.m_bEditingPassword = false;
    this.getUserAuthProvider();
    this.getUserTotalCredits();
    this.getUserSubscription();
  }

  getUserTotalCredits() {
    this.m_oCreditsService.getCreditsByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_iCreditsBalance = oResponse;
        }
      },
      error: oError => { }
    })
  }

  getUserSubscription() {
    this.m_oSubscriptionService.getActiveSubscriptionForUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_oActiveSubscription = oResponse;
        }
      },
      error: oError => { }
    })
  }  

  getSubscriptionStatus() {
    if (this.m_oConstantsService.areSubscriptionsActivated()) {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveSubscription)) {
        return "No Valid Subscription Available";
      }
      else {
        return this.m_oActiveSubscription.name + " [" +  this.m_oActiveSubscription.typeName + "] - End Date: " + this.m_oActiveSubscription.endDate
      }
    }
    else {
      return "This is a free access platform";
    }
  }

  getShowCreditsBalance() {
    if (this.m_oConstantsService) {
      return this.m_oConstantsService.areSubscriptionsActivated();
    }
    return true;
  }

  getUserAuthProvider() {
    return this.m_oUser.authProvider;
  }

  isKeycloakUser(): boolean {
    return (this.m_oUser?.authProvider || '').toLowerCase() === 'keycloak';
  }

  getKeycloakAccountUrl(): string {
    const sAuthUrl = this.m_oConstantsService.getAUTHURL().replace(/\/$/, '');
    return `${sAuthUrl}/account/`;
  }

  getUserInfo() {
    return {
      name: this.m_oEditUser.fname,
      surname: this.m_oEditUser.lname,
      publicNickName: this.m_oEditUser.publicNickName
    }
  }

  changeUserInfo() {
    let oJsonToSend = this.getUserInfo();

    let sChangeSuccess = this.m_oTranslate.instant("USER_ACCOUNT_CHANGE_SUCCESS");
    let sChangeError = this.m_oTranslate.instant("USER_ACCOUNT_CHANGE_ERROR");
    let sChangeErrorTitle = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION");

    this.m_oAuthService.changeUserInfo(oJsonToSend).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) || oResponse.userId !== "") {
          if (oResponse.boolValue === false) {
            this.m_oNotificationDisplayService.openAlertDialog(sChangeError, sChangeErrorTitle, 'danger');
          } else {
            this.m_oNotificationDisplayService.openSnackBar(sChangeSuccess, '', 'success-snackbar');

            this.m_oUser = oResponse;
            this.m_oConstantsService.setUser(this.m_oUser);
          }
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sChangeError, sChangeErrorTitle, 'danger');
      }
    });
  }

  setPasswordInput(oEvent, sField: 'currentPassword' | 'newPassword' | 'newPasswordConfirm') {
    this.m_oEditPassword[sField] = oEvent.event.target.value;
    this.m_bEditingPassword = true;
  }

  changeUserPassword() {
    const sCurrentPassword = this.m_oEditPassword.currentPassword;
    const sNewPassword = this.m_oEditPassword.newPassword;
    const sNewPasswordConfirm = this.m_oEditPassword.newPasswordConfirm;

    if (!sCurrentPassword || !sNewPassword || !sNewPasswordConfirm) {
      this.m_oNotificationDisplayService.openAlertDialog('All password fields are required.', 'Password change failed', 'danger');
      return;
    }

    if (sNewPassword !== sNewPasswordConfirm) {
      this.m_oNotificationDisplayService.openAlertDialog('The new password and confirmation do not match.', 'Password change failed', 'danger');
      return;
    }

    const oJsonToSend = {
      currentPassword: sCurrentPassword,
      newPassword: sNewPassword
    };

    this.m_oAuthService.changePassword(oJsonToSend).subscribe({
      next: (oResponse: any) => {
        if (oResponse && oResponse.boolValue === true) {
          this.m_oNotificationDisplayService.openSnackBar('Password updated successfully.', '', 'success-snackbar');
          this.m_oEditPassword = {
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
          };
          this.m_bEditingPassword = false;
          return;
        }

        this.m_oNotificationDisplayService.openAlertDialog('Unable to change the password. Check your current password and try again.', 'Password change failed', 'danger');
      },
      error: () => {
        this.m_oNotificationDisplayService.openAlertDialog('Unable to change the password. Check your current password and try again.', 'Password change failed', 'danger');
      }
    });
  }

  onSaveChanges() {
    if (this.m_bEditingPassword) {
      this.changeUserPassword();
    }

    if (this.m_bEditingUserInfo) {
      this.changeUserInfo();
    }
  }

  deleteMyAccount() {
    const sMessage = 'This action cannot be reverted, and will clean all your data in WASDI. Are you sure to delete your account?';

    this.m_oNotificationDisplayService.openConfirmationDialog(sMessage, 'Delete my account', 'danger').subscribe((bConfirmed: boolean) => {
      if (!bConfirmed) {
        return;
      }

      this.m_oAdminDashboardService.deleteUser(this.m_oUser.userId).subscribe({
        next: () => {
          this.m_oNotificationDisplayService.openSnackBar('Your account has been deleted.', 'Account deleted', 'success-snackbar');
          this.m_oConstantsService.setUser({} as User);
          this.m_oAuthService.logout();
        },
        error: () => {
          this.m_oNotificationDisplayService.openAlertDialog('Unable to delete your account right now. Please try again later.', 'Delete account failed', 'danger');
        }
      });
    });
  }

  getUserInfoInput(oEvent) {
    if (oEvent.label === 'Name') {
      this.m_oEditUser.fname = oEvent.event.target.value;
    }
    if (oEvent.label === 'Surname') {
      this.m_oEditUser.lname = oEvent.event.target.value;
    }
    if (oEvent.label === 'Email') {
      this.m_oEditUser.userId = oEvent.event.target.value;
    }
    if (oEvent.label === 'NickName') {
      this.m_oEditUser.publicNickName = oEvent.event.target.value;
    }
    this.m_bEditingUserInfo = true;
  }
}
