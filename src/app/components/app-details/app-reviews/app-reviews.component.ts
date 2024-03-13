import { AfterViewChecked, Component, HostListener, Input, OnChanges } from '@angular/core';

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

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-app-reviews',
  templateUrl: './app-reviews.component.html',
  styleUrls: ['./app-reviews.component.css']
})
export class AppReviewsComponent implements OnChanges, AfterViewChecked {

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

  m_bIsOwner: boolean = false;

  m_bShowReviewBox: boolean = false;
  m_bIsEditing: boolean = false;
  m_sUserId: string = "";
  m_bIsEditingComment: boolean = false;

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

  ngAfterViewChecked(): void {
    this.m_sUserId = this.m_oConstantsService.getUserId();
    if (this.oProcessor.publisher === this.m_sUserId) {
      this.m_bIsOwner = true;
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
          console.log(oResponse.reviews);
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



  showReviewInput() {
    this.m_bShowReviewBox = !this.m_bShowReviewBox;
  }
}
