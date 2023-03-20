import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent {
  title: string;
  message: string;
  type: string;

  constructor(public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogModel) {

  }
  
  //Execute Sharing based on user input:
  onShare() {

  }
  //Execute Removal of Sharing permission:
  onRemove() {

  }

  //Get all the users that the resource has been shared with: 
  getSharedUsers() {

  }


}

export class ShareDialogModel {

}