import { Component, Input, OnChanges } from '@angular/core';

//Angular Materials Imports
import { MatDialog } from '@angular/material/dialog';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ReviewEditorDialogComponent } from './review-editor-dialog/review-editor-dialog.component';
import { TranslateService } from '@ngx-translate/core';

//Component Imports:
import { CommentEditorDialogComponent } from './comment-editor-dialog/comment-editor-dialog.component';

//Font Awesome Improts:
import { faEdit, faSpaghettiMonsterFlying, faStar, faStarHalf, faStarHalfAlt, faTrashCan } from '@fortawesome/free-solid-svg-icons';

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-app-reviews',
  templateUrl: './app-reviews.component.html',
  styleUrls: ['./app-reviews.component.css']
})
export class AppReviewsComponent implements OnChanges {
  faAlien = faSpaghettiMonsterFlying;
  faEdit = faEdit;
  faStarHalf = faStarHalf;
  faStarHalfAlt = faStarHalfAlt;
  faStar = faStar;
  faStarRegular = faStar;
  faTrash = faTrashCan;

  @Input() oProcessor: any;

  m_oReviewsInfo = {
    avgVote: -1,
    numberOfOneStarVotes: 0,
    numberOfTwoStarVotes: 0,
    numberOfThreeStarVotes: 0,
    numberOfFourStarVotes: 0,
    numberOfFiveStarVotes: 0,
    alreadyVoted: false,
    reviews: []
  }

  m_bReviewsWaiting: boolean;
  m_bUserHasReviewed: boolean = false;
  m_bShowLoadMoreReviews: boolean;
  m_bCommentsWaiting: boolean;
  m_bShowComments: boolean;

  m_oReviewsWrapper: any;
  m_oSelectedProcessor: any;

  m_iReviewsPage: number = 0;
  m_iReviewItemsPerPage: number;

  m_aoComments: any = [];

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorMediaService,
    private m_oTranslate: TranslateService,
  ) { }

  ngOnChanges(): void {
    if (this.oProcessor.processorId) {
      this.m_oSelectedProcessor = this.oProcessor;
      this.getReviews();
    }
  }

  /********** Reviews Methods **********/
  /**
  * Calls server to return all Reviews associated with the processor
  */
  getReviews(): void {
    this.m_bReviewsWaiting = true;

    let sReviewsErrorMsg: string = this.m_oTranslate.instant("MSG_MKT_REVIEWS_ERROR");

    this.m_oProcessorService.getProcessorReviews(this.m_oSelectedProcessor.processorName, this.m_iReviewsPage, this.m_iReviewItemsPerPage = 4).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) == false) {
          this.m_oReviewsInfo = oResponse;
          console.log(this.m_oReviewsInfo);
          if (oResponse.reviews.length === 0) {
            this.m_bShowLoadMoreReviews = false;
          }
          if (oResponse.reviews.length <= this.m_iReviewItemsPerPage) {
            this.m_bShowLoadMoreReviews = false;
          }
          //If the user has already reviewed this app, set m_bUserHasReviewed to true
          this.m_oReviewsInfo.reviews.forEach(oReview => {
            if (oReview.userId === this.m_oConstantsService.getUserId()) {
              this.m_bUserHasReviewed = true;
            }
          })
        }
        else {
          this.m_oNotificationDisplayService.openAlertDialog(sReviewsErrorMsg);
        }
        this.m_bReviewsWaiting = false;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sReviewsErrorMsg);
      }
    });
  }

  /**
   * Handler Function for Load More reviews button
   */
  loadMoreReviews(): void {
    this.m_iReviewsPage = this.m_iReviewsPage + 1;
    this.m_bReviewsWaiting = true;

    var sReviewsErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEWS_ERROR");

    // Get the reviews
    this.m_oProcessorMediaService.getProcessorReviews(this.m_oSelectedProcessor.processorName, this.m_iReviewsPage, this.m_iReviewItemsPerPage = 4).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) == false) {
          if (oResponse.reviews.length == 0) {
            this.m_bShowLoadMoreReviews = false;
          } else {
            this.m_oReviewsWrapper.reviews = this.m_oReviewsWrapper.reviews.concat(oResponse.reviews);
          }
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sReviewsErrorMsg)

        }
        this.m_bReviewsWaiting = false;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sReviewsErrorMsg);
        this.m_bReviewsWaiting = false;
      }
    });
  }

  /**
   * Opens dialog to create a new review
   */
  addNewReview(): void {
    let oDialogRef = this.m_oDialog.open(ReviewEditorDialogComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        isEditing: false,
        selectedProcessor: this.m_oSelectedProcessor,
        review: null
      }
    });

    oDialogRef.afterClosed().subscribe(oResult => {
      this.getReviews();
    })
  }

  /**
   * Opens dialog to update review information (vote, title, and text)
   * @param oReview 
   */
  updateReview(oReview: any): void {
    let oDialogRef = this.m_oDialog.open(ReviewEditorDialogComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        isEditing: true,
        selectedProcessor: this.m_oSelectedProcessor,
        review: oReview
      }
    })

    oDialogRef.afterClosed().subscribe(oResult => {
      this.getReviews();
    })
  }

  /**
   * Calls API to remove the selected Review
   * @param oReview 
   */
  deleteReview(oReview: any): void {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEWS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_DELETE_CONFIRM");

    //Confirm that User wishes to delete the Review:
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        //If User agrees, the Review is deleted
        this.m_oProcessorMediaService.deleteProcessorReview(this.m_oSelectedProcessor.processorId, oReview.id).subscribe({
          next: oResponse => {
            this.getReviews();
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }
    })
  }

  /**
   * Checks if the Review belongs to the active user
   * @param oReview 
   * @returns {boolean}
   */
  isMineReview(oReview: any): boolean {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oReview)) {
      return false;
    }

    let sActualUser = this.m_oConstantsService.getUserId();
    //If Current User is same as review user, return true: 
    if (sActualUser === oReview.userId) {
      return true;
    } else {
      return false
    }
  }

  /********** Comment Methods **********/
  /**
   * Calls server to return all comments associated with a review
   * @param oReview 
   * @returns {boolean}
   */
  getComments(oReview: any): boolean {
    let sReviewId = oReview.id;

    this.m_bCommentsWaiting = true;

    let sCommentsErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENTS_ERROR");

    this.m_oProcessorMediaService.getReviewComments(sReviewId, undefined, undefined).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) == false) {
          if (!oResponse) {
            this.m_bShowComments = false
          } else {

            this.m_aoComments = oResponse;
            this.m_bCommentsWaiting = false;
            this.m_bShowComments = true;
          }
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sCommentsErrorMsg);
        this.m_bCommentsWaiting = false;
      }
    });
    return true;
  }

  /**
   * Opens dialog to add new comment
   * @param oReview 
   */
  addNewComment(oReview: any): void {
    let oDialogRef = this.m_oDialog.open(CommentEditorDialogComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        isEditing: false,
        reviewId: oReview.id,
        selectedComment: null
      }
    });

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      this.getComments(oReview);
    })
  }

  /**
   * Opens dialog to update comment text
   * @param oComment 
   * @param oReview 
   */
  updateComment(oComment: any, oReview: any): void {
    let oDialogRef = this.m_oDialog.open(CommentEditorDialogComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        isEditing: true,
        selectedComment: oComment
      }
    });
    oDialogRef.afterClosed().subscribe(oDialogResult => {
      this.getComments(oReview);
    })
  }

  /**
   * Calls the API to remove the selected Comment
   * @param oComment 
   * @param oReview 
   */
  deleteComment(oComment: any, oReview: any): void {

    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENTS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_DELETE_CONFIRM");

    //Confirm Comment Removal
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        //If User agrees, the Comment is deleted
        this.m_oProcessorMediaService.deleteReviewComment(this.m_oSelectedProcessor.processorId, oReview.id).subscribe({
          next: oResponse => {
            this.getReviews();
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }
    });
  }

  /**
   * Checks if the Comment belongs to the Active User
   * @param oComment 
   * @returns {boolean}
   */
  isMineComment(oComment: any): boolean {
    if (oComment.userId === this.m_oConstantsService.getUserId()) {
      return true;
    } else {
      return false
    }
  }
}
