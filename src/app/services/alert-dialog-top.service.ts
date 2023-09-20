import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AlertDialogTopService {

  constructor(private m_oDialog: MatDialog) { }

  openDialog(iTimeoutInput: number, sMessage: string): void {
    let iTimeout: number = iTimeoutInput;
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

@Component({
  selector: 'AlertDialog',
  template: `
  <div class="p-1">Alert</div>
  <div class="d-flex flex-column p-1" mat-dialog-actions>
    {{m_oData}}
    <button class="btn btn-secondary btn-sm align-self-end" mat-button (click)="closeDialog()">Close</button>
  </div>`
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