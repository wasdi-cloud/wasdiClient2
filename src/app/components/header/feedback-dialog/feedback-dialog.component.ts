import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstantsService } from 'src/app/services/constants.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { FeedbackService } from 'src/app/services/api/feedback.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.css']
})
export class FeedbackDialogComponent implements OnInit {
  m_oActiveUser: any = null;
  m_oFeedback: {
    title: string | null,
    message: string | null
  } = { title: null, message: null }

  constructor(
    private m_oDialogRef: MatDialogRef<FeedbackDialogComponent>,
    private m_oConstantsService: ConstantsService,
    private m_oFeedbackService: FeedbackService,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) { }

  ngOnInit(): void {
    this.m_oActiveUser = this.m_oConstantsService.getUser();
  }

  openDiscord() {
    window.open('https://discord.gg/FkRu2GypSg', '_blank')
  }

  sendFeedback() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oFeedback) || !this.m_oFeedback.title || !this.m_oFeedback.message) {
      console.log("Error sending message");
      return false;
    }
    this.m_oFeedbackService.sendFeedback(this.m_oFeedback).subscribe(oResponse => {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.boolValue === true) {
        this.m_oNotificationDisplayService.openSnackBar("Feedback sent!", "Thank you");
        this.onDismiss()
        return true;
      } else {
        this.m_oNotificationDisplayService.openAlertDialog("Error while sending feedback");
        return false;
      }
    });
    return true;
  }

  /**
   * Set the Feedback object with the user input on event changes (from input field or textarea)
   * @param sTitle 
   * @param oEvent 
   */
  getUserInput(sTitle: string, oEvent: any) {
    if (sTitle === 'title') {
      this.m_oFeedback.title = oEvent.event.target.value;
    } else if (sTitle === 'message') {
      this.m_oFeedback.message = oEvent.target.value;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
