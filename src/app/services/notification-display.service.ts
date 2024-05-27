import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AlertDialogComponent } from 'src/app/shared/dialogs/alert-dialog/alert-dialog.component';
import { NotificationSnackbarComponent } from 'src/app/shared/dialogs/notification-snackbar/notification-snackbar.component';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationDisplayService {

  constructor(
    private m_oMatDialog: MatDialog,
    private m_oMatSnackBar: MatSnackBar) { }

  /**
   * Handler to 
   * @param sMessage 
   * @param sAction 
   * @param hPosition 
   * @param vPosition 
   * @param className 
   */
  openSnackBar(sMessage: string, sTitle?: string, className?: string) {
    this.m_oMatSnackBar.openFromComponent(NotificationSnackbarComponent, {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [className ? className : 'info-snackbar'],
      data: { message: sMessage, title: sTitle ? sTitle : "Update", class: className ? className : 'info-snackbar' }
    });
  }

  /**
   * Handler to open the alert dialog componenet 
   * @param sMessage 
   * @param iTimeoutInput 
   */
  openAlertDialog(sMessage: string, iTimeoutInput?: number): void {
    //Set default 4 second timeout to close alert dialog
    let iTimeout = 4000;
    if (iTimeoutInput) {
      iTimeout = iTimeoutInput;
    }
    let oDialogRef = this.m_oMatDialog.open(AlertDialogComponent, {
      data: sMessage
    });

    //Set Automatic timeout for dialog
    oDialogRef.afterOpened().subscribe(oResponse => {
      setTimeout(() => {
        oDialogRef.close();
      }, iTimeout)
    });
  }

  /**
   * Handle open of confirmation dialog
   * @param sMessage 
   * @returns 
   */
  openConfirmationDialog(sMessage: string) {
    let oDialogRef = this.m_oMatDialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: {
        message: sMessage
      }
    })

    return oDialogRef.afterClosed();
  }
}