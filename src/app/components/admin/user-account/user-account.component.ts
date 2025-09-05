import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { CreditsService } from 'src/app/services/api/credits.service'; 
import { SubscriptionService } from 'src/app/services/api/subscription.service';

import { User } from 'src/app/shared/models/user.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
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
    private m_oSubscriptionService: SubscriptionService
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

  changeUserPassword() { }

  onSaveChanges() {
    if (this.m_bEditingPassword) {
      this.changeUserPassword();
    }

    if (this.m_bEditingUserInfo) {
      this.changeUserInfo();
    }
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
