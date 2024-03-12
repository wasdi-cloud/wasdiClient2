import { Component, Input, OnInit } from '@angular/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
  selector: 'app-review-input',
  templateUrl: './review-input.component.html',
  styleUrls: ['./review-input.component.css']
})
export class ReviewInputComponent implements OnInit {
  @Input() m_oProcessor: any;
  @Input() m_sUserId: string;

  @Input() m_bIsEditing: boolean = false;

  m_iPreviewRating: number = 0;

  m_oUserReview = {
    vote: -1,
    title: "",
    comment: "",
    processorId: ""
  }

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_oUserReview.processorId = this.m_oProcessor.processorId;
    // if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData.review) === false) {
    //   this.m_oUserReview.title = this.m_oData.review.title
    //   this.m_oUserReview.comment = this.m_oData.review.comment;
    //   this.m_oUserReview.vote = this.m_oData.review.vote;
    // }
    // this.m_bIsEditing = this.m_oData.isEditing;
    // this.m_oUserReview.processorId = this.m_oData.selectedProcessor.processorId;
  }

  addReview() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVE_ERROR");

    if (!this.m_oUserReview.comment || !this.m_oUserReview.vote) {
      let sError = "Please complete your Review";
      this.m_oNotificationDisplayService.openAlertDialog(sError);
    } else {
      this.m_oProcessorMediaService.addProcessorReview(this.m_oUserReview).subscribe({
        next: oResponse => {
          this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, "Close", "right", "bottom");
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
        }
      });
    }
  }

  getUserInput(oEvent) {
    this.m_oUserReview.comment = oEvent.target.value;
  }
}
