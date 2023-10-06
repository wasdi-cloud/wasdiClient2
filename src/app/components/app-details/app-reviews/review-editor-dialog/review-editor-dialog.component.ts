import { Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { TranslateService } from '@ngx-translate/core';

import { faFloppyDisk, faStar, faTrash, faX } from '@fortawesome/free-solid-svg-icons';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-review-editor-dialog',
  templateUrl: './review-editor-dialog.component.html',
  styleUrls: ['./review-editor-dialog.component.css']
})
export class ReviewEditorDialogComponent implements OnInit {
  //Font Awesome Icons:
  faX = faX;
  faTrash = faTrash;
  faSave = faFloppyDisk;
  faStar = faStar;

  m_oSelectedProcessor: any;


  m_bIsEditing: boolean;

  m_iPreviewRating: number = 0;

  m_oUserReview = {
    vote: -1,
    title: "",
    comment: "",
    processorId: ""
  }


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oDialogRef: MatDialogRef<ReviewEditorDialogComponent>,
    private m_oNotificationService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData.review) === false) {
      this.m_oUserReview.title = this.m_oData.review.title
      this.m_oUserReview.comment = this.m_oData.review.comment;
      this.m_oUserReview.vote = this.m_oData.review.vote;
    }
    this.m_bIsEditing = this.m_oData.isEditing;
    this.m_oUserReview.processorId = this.m_oData.selectedProcessor.processorId;
  }

  /**
   * Add a new Revier
   * @returns boolean
   */
  addNewReview() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVE_ERROR");

    if (!this.m_oUserReview.comment || !this.m_oUserReview.title || !this.m_oUserReview.vote) {
      let sError = "Please complete your Review";
      this.m_oAlertDialog.openDialog(4000, sError);
      return false;
    }

    this.m_oProcessorMediaService.addProcessorReview(this.m_oUserReview).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar(sSavedMsg, "Close", "right", "bottom");
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sErrorMsg);
      }
    });
    this.onDismiss()
    return true;
  }

  /**
   * Update a Review: 
   */
  updateReview() {
    let sSavedMessage: string;
    let sErrorMessage: string;

    this.m_oTranslate.get("MSG_MKT_REVIEW_UPDATED").subscribe(sTranslation => {
      sSavedMessage = sTranslation;
    });

    this.m_oTranslate.get("MSG_MKT_REVIEW_UPDATE_ERROR").subscribe(sTranslation => {
      sErrorMessage = sTranslation;
    });

    this.m_oProcessorMediaService.updateProcessorReview(this.m_oUserReview).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar(sSavedMessage, "Close", "right", "bottom");
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sErrorMessage);
      }
    });
    this.onDismiss();
  }

  /**
   * Dismiss Dialog
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
