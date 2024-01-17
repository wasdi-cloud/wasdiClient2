import { Component, Inject } from '@angular/core';

import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarDismiss, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification-snackbar',
  templateUrl: './notification-snackbar.component.html',
  styleUrls: ['./notification-snackbar.component.css']
})
export class NotificationSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public m_oData: any,
    private m_oSnackbarRef: MatSnackBarRef<NotificationSnackbarComponent>,
  ) { }

  onDismiss() {
    this.m_oSnackbarRef.dismiss();
  }
  }
