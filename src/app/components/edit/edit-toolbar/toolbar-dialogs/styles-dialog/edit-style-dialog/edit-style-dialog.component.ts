import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { StyleService } from 'src/app/services/api/style.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-edit-style-dialog',
  templateUrl: './edit-style-dialog.component.html',
  styleUrls: ['./edit-style-dialog.component.css']
})
export class EditStyleDialogComponent implements OnInit {
  faX = faX;

  m_sActiveTab: string = "editStyle"
  m_oStyle: any;

  m_sStyleXML: string = '';

  m_oEditStyleForm = {} as {
    sName: string,
    sDescription: string,
    bIsPublic: boolean,

  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oDialogRef: MatDialogRef<EditStyleDialogComponent>,
    private m_oNotificationService: NotificationDisplayService,
    private m_oStyleService: StyleService
  ) { }

  ngOnInit(): void {
    if (this.m_oData) {
      this.m_oStyle = this.m_oData.styleInfo;
      this.m_oEditStyleForm.bIsPublic = this.m_oData.styleInfo.public;
      this.m_oEditStyleForm.sDescription = this.m_oData.styleInfo.description;
      if (this.m_oData.styleXML) {
        this.m_sStyleXML = this.m_oData.styleXML;
      } else {
        this.getStyleXML(this.m_oStyle.styleId)
      }
    }
  }

  updateStyle() {
    if (this.m_oEditStyleForm.sDescription === undefined) {
      this.m_oEditStyleForm.sDescription = '';
    }
    this.m_oStyleService.updateStyleParameters(this.m_oStyle.styleId, this.m_oEditStyleForm.sDescription, this.m_oEditStyleForm.bIsPublic).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar("STYLE UPDATED", "Close", "right", "bottom");
        this.onDismiss(); 
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "ERROR IN UPDATING THIS STYLE");
      }
    })
  }

  getStyleXML(sStyleId: string) {
    this.m_oStyleService.getStyleXml(sStyleId).subscribe({
      next: oResponse => {
        this.m_sStyleXML = oResponse;
      },
      error: oError => { }
    })
  }

  updateStyleXML(sStyleId: string, sStyleXml: string) {
    let oBody = new FormData();
    oBody.append('styleXml', sStyleXml);
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sStyleId) === false) {
      this.m_oStyleService.postStyleXml(sStyleId, oBody).subscribe({
        next: oResponse => {
          this.m_oNotificationService.openSnackBar("STYLE XML UPDATED", "Close", "right", "bottom");
          this.onDismiss();
        },
        error: oError => {
          this.m_oAlertDialog.openDialog(4000, "ERROR IN UPDATING STYLE XML");
        }
      })
    }
  }

  setActiveTab(sTabName: string, event: MouseEvent) {
    event.preventDefault()
    this.m_sActiveTab = sTabName;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
