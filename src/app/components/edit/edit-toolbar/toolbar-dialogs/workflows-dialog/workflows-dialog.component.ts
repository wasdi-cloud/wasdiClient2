import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faDownload, faEdit, faLaptopCode, faPlus, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-workflows-dialog',
  templateUrl: './workflows-dialog.component.html',
  styleUrls: ['./workflows-dialog.component.css']
})
export class WorkflowsDialogComponent {
  faX = faX;
  faDownload = faDownload; 
  faEdit = faEdit; 
  faLaptop = faLaptopCode; 
  faPlus = faPlus; 
  constructor(private m_oMatDialogRef: MatDialogRef<WorkflowsDialogComponent>) { }

  onDismiss() {
    this.m_oMatDialogRef.close()
  }
}
