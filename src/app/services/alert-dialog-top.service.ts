import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AlertDialogTopService {

  constructor(private m_oDialog: MatDialog,
    private m_oSanitizer: DomSanitizer) { }

  openDialog(iTimeoutInput: number, sMessage: any): void {
    let iTimeout: number = iTimeoutInput;
    sMessage =  this.m_oSanitizer.bypassSecurityTrustHtml(sMessage.replace(/\n/g, "<br />"))
    let oDialogRef = this.m_oDialog.open(AlertDialog, {
      width: '300px',
      data: sMessage
    });

    //Set Automatic timeout for dialog
    oDialogRef.afterOpened().subscribe(oResponse => {
      setTimeout(() => {
        oDialogRef.close();
      }, iTimeout)
    })
  }
}

// Alert Dialog Component
@Component({
  selector: 'AlertDialog',
  template: `
  <p class="d-flex flex-column p-1" mat-dialog-actions [innerHTML]="m_oData"></p>
<button class="btn btn-secondary btn-sm align-self-end" mat-button (click)="closeDialog()">Close</button>`
})
export class AlertDialog {
  constructor(
    public m_oDialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public m_oData: any
  ) { }

  closeDialog() {
    this.m_oDialogRef.close();
  }
}