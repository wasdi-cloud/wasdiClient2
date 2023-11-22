import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { StyleService } from 'src/app/services/api/style.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-new-style-dialog',
  templateUrl: './new-style-dialog.component.html',
  styleUrls: ['./new-style-dialog.component.css']
})
export class NewStyleDialogComponent {
  faX = faX;

  m_oNewStyle = {} as {
    sStyleName: string,
    sStyleDescription: string,
    bStyleIsPublic: boolean,
    sFileName: string
  }
  //Field with the current uploaded file

  m_oFile: any;
  m_sSelectedFileName: string;
  m_bIsUploadingStyle: boolean = false;

  constructor(
    private m_oDialogRef: MatDialogRef<NewStyleDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oStyleService: StyleService) { }

  onUploadStyle() {
    this.uploadStyle(this.m_oNewStyle.sStyleName, this.m_oNewStyle.sStyleDescription, this.m_oNewStyle.bStyleIsPublic, this.m_oFile)
  }

  uploadStyle(sName: string, sDescription: string, bIsPublic: boolean, oBody: any) {
    this.m_bIsUploadingStyle = true;

    this.m_oStyleService.uploadFile(sName, sDescription, oBody, bIsPublic).subscribe({
      next: oResponse => {
        if (oResponse && oResponse.boolValue == true) {
          this.m_oNotificationDisplayService.openSnackBar("STYLE UPLOADED", "Close", "right", "bottom");
        } else {
          this.m_oNotificationDisplayService.openAlertDialog( "Error in uploading Style");
        }
        this.m_bIsUploadingStyle = false;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog( "Error in uploading Style");
      }
    });
    return true;
  }

  getSelectedFile(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oFile = oEvent.file;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
