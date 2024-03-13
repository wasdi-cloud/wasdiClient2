import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() m_bIsEditing?: boolean = false;
  @Input() m_bIsReview: boolean = true;
  @Input() m_oReview?: any = null;
  @Input() m_oComment?: any = null;
  @Output() m_oReviewEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() m_sReviewId?: string = "";

  m_iPreviewRating: number = 0;

  m_oUserReview: any = {
    vote: -1,
    title: "",
    comment: "",
    processorId: ""
  }

  m_oCommentInfo: any = {
    reviewId: "",
    text: ""
  }

  m_sReviewText: string = "";

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    if (this.m_bIsReview) {
      this.m_oUserReview.processorId = this.m_oProcessor.processorId;
    }

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oReview)) {
      this.m_oUserReview.title = this.m_oReview.title
      this.m_oUserReview.comment = this.m_oReview.comment;
      this.m_oUserReview.vote = this.m_oReview.vote;
      this.m_oUserReview.id = this.m_oReview.id;
      this.m_sReviewText = this.m_oReview.comment
    }

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oComment)) {
      console.log(this.m_oComment)
      this.m_oCommentInfo.reviewId = this.m_sReviewId
      this.m_oCommentInfo.commentId = this.m_oComment.id;
      this.m_oCommentInfo.text = this.m_oComment.text;
      this.m_sReviewText = this.m_oComment.text;
    }
  }

  getUserInput(oEvent) {
    this.m_sReviewText = oEvent.target.value;
  }

  /********** Review Handling Methods **********/
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

  deleteReview() {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEWS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_DELETE_CONFIRM");

    //Confirm that User wishes to delete the Review:
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        //If User agrees, the Review is deleted
        this.m_oProcessorMediaService.deleteProcessorReview(this.m_oProcessor.processorId, this.m_oReview.id).subscribe({
          next: oResponse => {
            // this.getReviews();
            this.m_oNotificationDisplayService.openSnackBar("Review Removed", "Close");
            this.emitCompletedReviewAction();
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }
    })
  }

  updateReview() {
    let sSavedMessage: string;
    let sErrorMessage: string;

    this.m_oUserReview.comment = this.m_sReviewText;

    this.m_oTranslate.get("MSG_MKT_REVIEW_UPDATED").subscribe(sTranslation => {
      sSavedMessage = sTranslation;
    });

    this.m_oTranslate.get("MSG_MKT_REVIEW_UPDATE_ERROR").subscribe(sTranslation => {
      sErrorMessage = sTranslation;
    });

    this.m_oProcessorMediaService.updateProcessorReview(this.m_oUserReview).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMessage, "Close");
        this.emitCompletedReviewAction();
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage);
      }
    });
  }

  emitCompletedReviewAction() {
    this.m_oReviewEmit.emit(true);
  }

  /********** Comment Handling Methods **********/
  addComment() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVE_ERROR");
    this.m_oCommentInfo.reviewId = this.m_sReviewId
    this.m_oCommentInfo.commentId = this.m_oComment.id;
    console.log(this.m_oCommentInfo);
    this.m_oProcessorMediaService.addReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, "Close")
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
      }
    });
  }

  deleteComment() {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENTS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_DELETE_CONFIRM");

    this.m_oProcessorMediaService.deleteReviewComment(this.m_oCommentInfo.reviewId, this.m_oCommentInfo.commentId).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Comment Removed", "Close");
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
      }
    });
  }

  updateComment() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED_ERROR");

    this.m_oCommentInfo.reviewId = this.m_sReviewId
    this.m_oCommentInfo.commentId = this.m_oComment.id;

    this.m_oCommentInfo.text = this.m_sReviewText;

    this.m_oProcessorMediaService.updateReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, "Close");
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, 4000);
      }
    });
  }

}
