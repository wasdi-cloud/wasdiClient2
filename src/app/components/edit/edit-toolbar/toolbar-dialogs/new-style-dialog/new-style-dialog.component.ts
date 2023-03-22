import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-new-style-dialog',
  templateUrl: './new-style-dialog.component.html',
  styleUrls: ['./new-style-dialog.component.css']
})
export class NewStyleDialogComponent {
  faX = faX; 

  constructor(private m_oDialogRef: MatDialogRef<NewStyleDialogComponent>) {}


  onDismiss() {
    this.m_oDialogRef.close(); 
  }
}
