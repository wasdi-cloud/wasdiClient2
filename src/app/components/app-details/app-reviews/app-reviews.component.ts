import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { faEdit, faSpaghettiMonsterFlying, faStar, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { MatDialog } from '@angular/material/dialog';
import { ReviewEditorDialogComponent } from './review-editor-dialog/review-editor-dialog.component';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { CommentEditorDialogComponent } from './comment-editor-dialog/comment-editor-dialog.component';

@Component({
  selector: 'app-app-reviews',
  templateUrl: './app-reviews.component.html',
  styleUrls: ['./app-reviews.component.css']
})
export class AppReviewsComponent implements OnChanges {
  faAlien = faSpaghettiMonsterFlying;
  faEdit = faEdit;
  faStar = faStar;
  faStarRegular = faStar;
  faTrash = faTrashCan;

  @Input() oProcessor: any;
  reviews: {
    comment: string,
    date: number,
    id: string,
    processorId: string,
    title: string,
    userId: string,
    vote: number
  }[] = []

  m_bReviewsWaiting: boolean;
  m_bUserHasReviewed: boolean = false;
  m_bShowLoadMoreReviews: boolean;
  m_bCommentsWaiting: boolean;
  m_bShowComments: boolean;


  m_oReviewsWrapper: any;
  m_oSelectedProcessor: any;
  m_sSelectedReview: any;
  m_iReviewsPage: number = 0;
  m_iReviewItemsPerPage: number;

  m_aoComments: any = [];
  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorMediaService,
    private m_oTranslate: TranslateService,
  ) {

  }

  ngOnChanges(): void {
    if (this.oProcessor.processorId) {
      this.m_oSelectedProcessor = this.oProcessor;
      console.log(this.oProcessor);
      this.refreshReviews();
    }
  }

  /********** Reviews Methods **********/
  refreshReviews() {
    this.m_bReviewsWaiting = true;

    let sReviewsErrorMsg: string;
    this.m_oTranslate.get("MSG_MKT_REVIEWS_ERROR").subscribe(sTranslation => {
      sReviewsErrorMsg = sTranslation;
    });

    this.m_oProcessorService.getProcessorReviews(this.m_oSelectedProcessor.processorName, this.m_iReviewsPage, this.m_iReviewItemsPerPage = 4).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) == false) {
          console.log(oResponse);
          this.reviews = oResponse.reviews;
          if (oResponse.reviews.length == 0) {
            this.m_bShowLoadMoreReviews = false;
          }
          this.reviews.forEach(oReview => {
            if (oReview.userId === this.m_oConstantsService.getUserId()) {
              this.m_bUserHasReviewed = true;
            }
          })
        }
        else {
          this.m_oAlertDialog.openDialog(4000, sReviewsErrorMsg);
        }
        this.m_bReviewsWaiting = false;
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sReviewsErrorMsg);
      }
    });
  }

  addNewReview() {
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
      this.refreshReviews();
    })
  }

  updateReview(oReview: any) {
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
      this.refreshReviews();
    })
  }

  deleteReview(oReview) {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_REVIEWS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_REVIEW_DELETE_CONFIRM");

    //Confirm that User wishes to delete the Review:
    let oDialogData = new ConfirmationDialogModel("Confirm Removal", sConfirmMsg);

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    });

    //If User agrees, the Review is deleted
    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oProcessorMediaService.deleteProcessorReview(this.m_oSelectedProcessor.processorId, oReview.id).subscribe({
          next: oResponse => {
            this.refreshReviews();
          },
          error: oError => {
            this.m_oAlertDialog.openDialog(4000, sErrorMsg);
          }
        })
      }
    });
  }

  isMineReview(oReview) {
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
  getComments(oReview) {
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
            console.log(this.m_aoComments);
            this.m_bCommentsWaiting = false;
            this.m_bShowComments = true;
          }
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sCommentsErrorMsg);
        this.m_bCommentsWaiting = false;
      }
    });
    return true;
  }

  addNewComment(oReview) {
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

  updateComment(oComment, oReview) {
    console.log(oComment);
    let oDialogRef = this.m_oDialog.open(CommentEditorDialogComponent, {
      height: '50vh',
      width: '50vw',
      data: {
        isEditing: true,
        selectedComment: oComment
      }
    });
    oDialogRef.afterClosed().subscribe(oDialogResult => {
      console.log("updating comments")
      this.getComments(oReview);
    })
  }

  deleteComment(oComment, oReview) {

    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENTS_ERROR");
    let sConfirmMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_DELETE_CONFIRM");

    let oDialogData = new ConfirmationDialogModel("Confirm Removal", sConfirmMsg);

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    });

    //If User agrees, the Review is deleted
    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oProcessorMediaService.deleteReviewComment(oComment.reviewId, oComment.commentId).subscribe({
          next: oResponse => {
            this.getComments(oReview);
          },
          error: oError => {
            this.m_oAlertDialog.openDialog(4000, sErrorMsg);
          }
        })
      }
    });
  }

  isMineComment(oComment) {
    if (oComment.userId === this.m_oConstantsService.getUserId()) {
      return true;
    } else {
      return false
    }
  }
}
