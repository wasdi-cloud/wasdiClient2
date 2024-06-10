import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent {
  title: string;
  resource: any;
  type: string;

  constructor(public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogModel) {
    this.type = data.type;
    this.resource = data.info;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}

export class ShareDialogModel {
  constructor(public type: string, public info: any) { }
}