import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  m_sTitle: string;
  m_sMessage: string;
  m_sClassName: 'generic' | 'success' | 'alert' | 'danger' | 'info' | string = "generic";
  m_bIsConfirmation: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogModel) {

  }
  ngOnInit(): void {
    this.m_sTitle = this.data.title;
    this.m_sMessage = this.data.message;
    this.m_sClassName = this.data.className
    this.m_bIsConfirmation = this.data.isConfirmation
  }

  onConfirm(): void {
    this.dialogRef.close(true)
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}

export class ConfirmationDialogModel {
  constructor(public title: string, public message: string, public className: string, public isConfirmation: boolean) { }
}