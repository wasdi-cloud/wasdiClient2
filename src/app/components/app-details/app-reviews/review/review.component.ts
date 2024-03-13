import { Component, Input, OnInit } from '@angular/core';
import { ConstantsService } from 'src/app/services/constants.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit{
  /**
   * Is the Review a REVIEW or a COMMENT? By default it is a review.
   */
  @Input() m_bIsReview: boolean = true;

  /**
   * Is the Review/Comment editor open?
   */
  @Input() m_bIsEditing: boolean = false;

  /**
   * Review Information
   */
  @Input() m_oReview?: any = null;

  /**
   * Comment information
   */
  @Input() m_oComment?: any = null;

  /**
   * Selected Processor Information
   */
  @Input() m_oSelectedProcessor?: any = null;

  /**
   * Review Id
   */
  @Input() m_sReviewId?: string = "";

  /**
   * Should the comments be shown?
   */
  m_bShowComments: boolean = false;

  /**
   * Is the user attempting to Add a new comment?
   */
  m_bAddComment: boolean = false;

  /**
   * Are the comments loading from the server?
   */
  m_bCommentsWaiting: boolean = false;

  /**
   * Is the user editing a review?
   */
  m_bEditingReview: boolean = false;

  /**
   * Is the user editing a comment? 
   */
  m_bIsEditingComment: boolean = false;

  /**
   * Array of comments - can also be a single comment object
   */
  m_aoComments: any = null;

  /**
   * User Id string
   */
  m_sUser: string = ""

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
      console.log(this.m_oComment)
  }

  /**
   * Calls server to return all comments associated with a review
   * @returns {boolean}
   */
  getComments(): boolean {
    let sReviewId = this.m_oReview.id;

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
   * Check if the user logged is the owner of the review
   * @returns boolean
   */
  isMineReview(): boolean {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oReview)) {
      return false;
    }

    let sActualUser = this.m_oConstantsService.getUserId();
    //If Current User is same as review user, return true: 
    if (sActualUser === this.m_oReview.userId) {
      return true;
    } else {
      return false
    }
  }

  /**
   * Toggle Review updater
   */
  updateReview(): void {
    this.m_bIsEditing = true;
    this.m_bEditingReview = true;
  }

  /**
   * Handle output from review input component
   * @param oEvent 
   */
  refreshReview(oEvent: any): void { }

  addNewComment() {
    this.m_bAddComment = !this.m_bAddComment;
    this.m_sUser = this.m_oConstantsService.getUserId();
  }

  isMineComment() {
    if (this.m_oComment.userId === this.m_oConstantsService.getUserId()) {
      return true;
    } else {
      return false
    }
  }

  updateComment() {
    this.m_bIsEditingComment = true;
    this.m_bIsEditing = true;
  }
}
