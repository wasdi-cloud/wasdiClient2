import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConstantsService } from 'src/app/services/constants.service';

import { User } from 'src/app/shared/models/user.model';
import { UserSettingsDialogComponent } from './header-dialogs/user-settings-dialog/user-settings-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  m_oUser: User;
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog
  ) { }

  ngOnInit(): void {
   this.m_oUser = this.m_oConstantsService.getUser()
   console.log(this.m_oUser)
  }

  openUserDashboard() {
    this.m_oDialog.open(UserSettingsDialogComponent);
  }
}

  // m_oFeedback: {
  //   title: string | null,
  //   message: string | null
  // } = { title: null, message: null }
  // constructor(
  //   private m_oFeedbackService: FeedbackService,
  // ) {
  //   //Register translation languages:
  //   m_oTranslate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
  //   m_oTranslate.setDefaultLang('en');

  // logout() {
  //   this.m_oConstantsService.logOut();
  //   this.m_oRouter.navigateByUrl("login");
  // }

  // sendFeedback() {
  //   if (typeof this.m_oFeedback === undefined || !this.m_oFeedback.title || !this.m_oFeedback.message) {
  //     console.log("Error sending message");
  //     return false;
  //   }

  //   this.m_oFeedbackService.sendFeedback(this.m_oFeedback).subscribe(oResponse => {
  //     if (typeof oResponse !== null && typeof oResponse !== undefined && oResponse.boolValue === true) {
  //       console.log("feedback sent")
  //       return true;
  //     } else {
  //       console.log("error sending feedback");
  //       return false;
  //     }
  //   });
  //   return true;
  // }


