import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationDisplayService {

  constructor(private m_oMatSnackBar: MatSnackBar) { }

  openSnackBar(sMessage: string, sAction: string,
    hPosition?: any, vPosition?: any,
    className?: any) {
    this.m_oMatSnackBar.open(sMessage, sAction, {
      duration: 15000,
      horizontalPosition: hPosition ? hPosition : 'center',
      verticalPosition: vPosition ? vPosition : 'top',
      panelClass: className
      // direction: "rtl"
    });
  }

}
