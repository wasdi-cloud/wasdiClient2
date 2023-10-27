import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ImageService } from 'src/app/services/api/image.service';
import { NewAppDialogComponent } from '../new-app-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-processor-tab-media',
  templateUrl: './processor-tab-media.component.html',
  styleUrls: ['./processor-tab-media.component.css']
})

export class ProcessorTabMediaComponent implements OnInit {
  faX = faX;
  @Input() m_oProcessor
  m_oProcessorLogo: any = null;
  m_sProcessorLogoName: string = "";
  m_oApplicationImage: any = null;
  m_sApplicaitonImageName: any = null;
  m_oImageToUpload: any = null;

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oImageService: ImageService,
    private m_oNotificationService: NotificationDisplayService) { }

  ngOnInit(): void { }

  updateProcessorLogo() {
    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorLogo)) {
      console.log("Please upload a file");
      return false;
    }

    this.m_oImageService.uploadProcessorLogo(this.m_oProcessor.processorId, this.m_oProcessorLogo).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar("PROCESSOR LOGO UPDATED", "Close", "right", "bottom");
        // this.m_oAlertDialog.openDialog(4000, "PROCESSOR LOGO UPDATED")
        // this.onDismiss();
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "GURU MEDITATION<br>THERE WAS AN ERROR UPDATING PROCESSOR LOGO");
      }
    });
    return true;
  }

  addApplicationImage() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oApplicationImage)) {
      console.log("Please upload a file");
      return false;
    }

    this.m_oImageService.uploadProcessorImage(this.m_oProcessor.processorId, this.m_oApplicationImage).subscribe({
      next: oResponse => {
        this.m_oProcessor.images.push(oResponse.stringValue);
        this.m_oAlertDialog.openDialog(4000, "PROCESSOR IMAGE ADDED");
      },
      error: oError => { }
    })
    return true;
  }


  removeProcessorImage(sImage) {
    let sImageName = this.m_oImageService.getImageNameFromUrl(sImage);

    this.m_oImageService.removeProcessorImage(this.m_oProcessor.processorName, sImageName).subscribe({
      next: oResponse => {
        this.m_oProcessor.images = this.m_oProcessor.images.filter(function (oImage) {
          return oImage !== sImage;
        });
        this.m_oAlertDialog.openDialog(4000, "PROCESSOR IMAGE REMOVED");
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "GURU MEDITATION<br>THERE WAS AN ERROR DELETING THE IMAGE")
      }
    });
  }

  onApplicationImageSelect(oEvent: any) {
    if (oEvent.files && oEvent.files[0]) {
      this.m_sApplicaitonImageName = oEvent.files[0].name
      this.m_oApplicationImage = new FormData();
      this.m_oApplicationImage.append('image', oEvent.files[0]);
    }
  }

  onLogoSelect(oEvent: any) {
    if (oEvent.files && oEvent.files[0]) {
      this.m_sProcessorLogoName = oEvent.files[0].name
      this.m_oProcessorLogo = new FormData();
      this.m_oProcessorLogo.append('image', oEvent.files[0]);
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
