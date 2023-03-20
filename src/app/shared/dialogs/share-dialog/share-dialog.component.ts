import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent {
  //font awesome icons: 
  faX = faX;

  title: string;
  resource: any;
  type: string;

  constructor(public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogModel) {
    this.type = data.type;
    this.resource = data.info;
  }

  //Execute Sharing based on user input:
  onShare(): void {

  }
  //Execute Removal of Sharing permission:
  onRemove(): void {

  }

  //Get all the users that the resource has been shared with: 
  getSharedUsers(): void {

  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}

export class ShareDialogModel {
  constructor(public type: string, public info: any) { }
}