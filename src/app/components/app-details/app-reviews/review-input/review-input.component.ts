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
  /**
   * The selected Processor - necessary for reviewing the processor
   */
  @Input() m_oProcessor: any;

  /**
   * User ID for the user writing the review/comment
   */
  @Input() m_sUserId: string;

  /**
   * Is the user Editing a Review/Comment? (Optional with default that the user is writing new content)
   */
  @Input() m_bIsEditing?: boolean = false;

  /**
   * Is the user writing a review? (Default that the user is writing a review. False means writing a comment)
   */
  @Input() m_bIsReview: boolean = true;

  /**
   * Inputted Review if the user is editing a review (Optional)
   */
  @Input() m_oReview?: any = null;

  /**
   * Inputted Comment if the user is editing a comment (Optional)
   */
  @Input() m_oComment?: any = null;

  /**
   * If the user is editing a Comment, include inputted Review Id (Optional only if not editing a comment)
   */
  @Input() m_sReviewId?: string = "";

  /**
   * Alert parent that Review Action is complete - if Created, Deleted, or Update emit true; else emit false
   */
  @Output() m_oReviewEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Alert parent that Comment Action is complete - if Created, Deleted, or Update emit true; else emit false
   */
  @Output() m_oCommentEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Model for the Review Star Rating
   */
  m_iPreviewRating: number = 0;

  /**
   * Model for the Review Text (collected from the textarea)
   */
  m_sReviewText: string = "";

  /**
   * Wrapper for Review Information
   */
  m_oUserReview: any = {
    vote: -1,
    title: "",
    comment: "",
    processorId: ""
  }

  /**
   * Wrapper for Comment Information
   */
  m_oCommentInfo: any = {
    reviewId: "",
    text: ""
  }

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
      this.m_sReviewText = this.m_oComment.text;
    }
  }

  /**
   * Get the user input from the textarea and assign to Review Text model
   * @param oEvent 
   */
  getUserInput(oEvent) {
    this.m_sReviewText = oEvent.target.value;
  }

  /********** Review Handling Methods **********/
  addReview() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_SAVE_ERROR");
    this.m_oUserReview.comment = this.m_sReviewText;

    if (!this.m_oUserReview.comment || !this.m_oUserReview.vote) {
      let sError = "Please complete your Review";
      this.m_oNotificationDisplayService.openAlertDialog(sError, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'alert');
    } else {
      this.m_oProcessorMediaService.addProcessorReview(this.m_oUserReview).subscribe({
        next: oResponse => {
          this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, '', 'success-snackbar');
          this.emitCompletedReviewAction(true);
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
        }
      });
    }
  }

  deleteReview() {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_REMOVE_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_DELETE_CONFIRM");

    //Confirm that User wishes to delete the Review:
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg, this.m_oTranslate.instant("KEY_PHRASES.CONFIRM_REMOVAL"), 'alert');

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        //If User agrees, the Review is deleted
        this.m_oProcessorMediaService.deleteProcessorReview(this.m_oProcessor.processorId, this.m_oReview.id).subscribe({
          next: oResponse => {
            // this.getReviews();
            this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("MSG_MKT_REVIEW_REMOVED"), '', 'success-snackbar');
            this.emitCompletedReviewAction(true);
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
          }
        })
      }
    })
  }

  updateReview() {
    let sSavedMessage: string = this.m_oTranslate.instant("MSG_MKT_REVIEW_UPDATED");
    let sErrorMessage: string = this.m_oTranslate.instant("MSG_MKT_REVIEW_UPDATE_ERROR");
    this.m_oCommentInfo.reviewId = this.m_sReviewId;
    this.m_oUserReview.comment = this.m_sReviewText;

    this.m_oProcessorMediaService.updateProcessorReview(this.m_oUserReview).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMessage, '', 'success-snackbar');
        this.emitCompletedReviewAction(true);
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
      }
    });
  }

  /********** Comment Handling Methods **********/
  addComment() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVE_ERROR");
    this.m_oCommentInfo.reviewId = this.m_sReviewId;
    this.m_oCommentInfo.text = this.m_sReviewText;

    this.m_oProcessorMediaService.addReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, '', 'success-snackbar');
        this.emitCompletedCommentAction(true);
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
      }
    });
  }

  /**
   * Calls the API to remove the selected Comment
   */
  deleteComment() {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_REMOVE_ERROR");

    this.m_oCommentInfo.reviewId = this.m_oComment.reveiwId;
    this.m_oCommentInfo.commentId = this.m_oComment.commendId;

    this.m_oNotificationDisplayService.openConfirmationDialog(this.m_oTranslate.instant("MSG_MKT_COMMENT_DELETE_CONFIRM"), this.m_oTranslate.instant("KEY_PHRASES.CONFIRM_REMOVAL"), "alert").subscribe(oResult => {
      if (oResult === true) {
        this.m_oProcessorMediaService.deleteReviewComment(this.m_oComment.reviewId, this.m_oComment.commentId).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("MSG_MKY_COMMENT_DELETED"), this.m_oTranslate.instant("KEY_PHRASES.SUCCESS"), 'success-snackbar');
            this.emitCompletedCommentAction(true);
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
          }
        });
      }
    })

  }

  updateComment() {
    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED_ERROR");

    this.m_oCommentInfo.reviewId = this.m_oComment.reviewId
    this.m_oCommentInfo.commentId = this.m_oComment.commentId;
    this.m_oCommentInfo.text = this.m_sReviewText;

    this.m_oProcessorMediaService.updateReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSavedMsg, '', 'success-snackbar');
        this.emitCompletedCommentAction(true);
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
      }
    });
  }

  /********** Emission Methods **********/
  emitCompletedReviewAction(bEmission: boolean) {
    this.m_oReviewEmit.emit(bEmission);
  }

  emitCompletedCommentAction(bEmission: boolean) {
    this.m_oCommentEmit.emit(bEmission);
  }
}
