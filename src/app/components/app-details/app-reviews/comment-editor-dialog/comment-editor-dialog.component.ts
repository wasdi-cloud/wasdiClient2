import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faSave, faTrash, faX } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-comment-editor-dialog',
  templateUrl: './comment-editor-dialog.component.html',
  styleUrls: ['./comment-editor-dialog.component.css']
})
export class CommentEditorDialogComponent implements OnInit {
  faSave = faSave;
  faTrash = faTrash;
  faX = faX;

  m_oCommentInfo = {
    commentId: '',
    reviewId: '',
    text: ''
  }

  m_bIsEditing: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oAlertService: AlertDialogTopService,
    private m_oDialogRef: MatDialogRef<CommentEditorDialogComponent>,
    private m_oNotificationService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_bIsEditing = this.m_oData.isEditing;
    if (this.m_oData.isEditing === true) {
      this.m_oCommentInfo.commentId = this.m_oData.selectedComment.commentId;
      this.m_oCommentInfo.reviewId = this.m_oData.selectedComment.reviewId;
      this.m_oCommentInfo.text = this.m_oData.selectedComment.text;
    } else {
      this.m_oCommentInfo.reviewId = this.m_oData.reviewId;
    }
  }

  addNewComment() {

    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_SAVE_ERROR");

    this.m_oProcessorMediaService.addReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar(sSavedMsg, "Close", "right", "bottom");
      },
      error: oError => {
        this.m_oAlertService.openDialog(4000, sErrorMsg);
      }
    });

    this.onDismiss();
  }


  updateComment() {

    let sSavedMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED");
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_COMMENT_UPDATED_ERROR");

    this.m_oProcessorMediaService.updateReviewComment(this.m_oCommentInfo).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar(sSavedMsg, "Close", "right", "bottom");
      },
      error: oError => {
        this.m_oAlertService.openDialog(4000, sErrorMsg)
      }
    });

    this.onDismiss();
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
