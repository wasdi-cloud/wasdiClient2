import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';

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
    userId: ""
  }

  m_aoLanguages = [
    {
      name: 'English',
      value: 'en'
    }, {
      name: 'Español',
      value: 'es'
    },
    {
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

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oTranslate: TranslateService
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
      userId: this.m_oUser.userId
    }

    this.m_bEditingPassword = false;
    this.getUserAuthProvider();
  }

  getUserAuthProvider() {
    return this.m_oUser.authProvider;
  }

  getUserInfo() {
    return {
      name: this.m_oEditUser.fname,
      surname: this.m_oEditUser.lname,
    }
  }

  changeUserInfo() {
    let oJsonToSend = this.getUserInfo();

    this.m_oAuthService.changeUserInfo(oJsonToSend).subscribe({
      next: oResponse => {
        console.log(oResponse)
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) || oResponse.userId !== "") {
          if (oResponse.boolValue === false) {
            this.m_oNotificationDisplayService.openAlertDialog("GURU MEDITATION<br>IMPOSSIBLE TO CHANGE USER INFO");
          } else {
            this.m_oNotificationDisplayService.openSnackBar("Changed user Info");

            this.m_oUser = oResponse;
            this.m_oConstantsService.setUser(this.m_oUser);
          }
        }
      },
      error: oError => { }
    })
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

    this.m_bEditingUserInfo = true;
  }
}
