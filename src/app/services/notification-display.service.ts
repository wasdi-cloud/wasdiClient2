import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
   * Handler to open the snackbar in the bottom right corner
   * @param sMessage
   * @param sTitle
   * @param className
   * @param permanent
   */
  openSnackBar(sMessage: string, sTitle?: string, className?: string,permanent?:boolean) {
    let duration=4000;
    if(permanent){
      //if it is null then its permanent
        duration=null;
    }
    this.m_oMatSnackBar.openFromComponent(NotificationSnackbarComponent, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [className ? className : 'info-snackbar'],
      data: { message: sMessage, title: sTitle ? sTitle : "Update", class: className ? className : 'info-snackbar' }
    });
  }

  /**
   * Handler to open the alert dialog component
   * @param sMessage
   * @param iTimeoutInput
   * @param sClassName
   */
  openAlertDialog(sMessage: string, sTitle?: string, sClassName?: string): void {
    //Set default 4 second timeout to close alert dialog
    let iTimeout = 4000;
    // if (iTimeoutInput) {
    //   iTimeout = iTimeoutInput;
    // }
    let oDialogRef = this.m_oMatDialog.open(ConfirmationDialogComponent, {
      maxWidth: '500px',
      panelClass: sClassName ? sClassName : 'generic',
      data: {
        message: sMessage,
        title: sTitle ? sTitle : "",
        isConfirmation: false,
        className: sClassName ? sClassName : 'generic'
      }
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
   * @param sTitle?
   * @param sClassName
   * @returns result of the dialog (boolean)
   */
  openConfirmationDialog(sMessage: string, sTitle?: string, sClassName?: string) {
    let oDialogRef = this.m_oMatDialog.open(ConfirmationDialogComponent, {
      width: '500px',
      panelClass: sClassName ? sClassName : 'generic',
      data: {
        message: sMessage,
        title: sTitle ? sTitle : "",
        className: sClassName ? sClassName : 'generic',
        isConfirmation: true
      }
    })

    return oDialogRef.afterClosed();
  }
}
