import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {
  m_sTitle: string;
  m_sMessage: string;

  constructor(
    public m_oDialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogModel
  ) {
    this.m_sTitle = data.sTitle;
    this.m_sMessage = data.sMessage;
  }

  ngOnInit(): void { }

  onDismiss(): void {
    this.m_oDialogRef.close(false);
  }
}

export class ErrorDialogModel {
  constructor(
    public sTitle: string,
    public sMessage: string
  ) { }
}