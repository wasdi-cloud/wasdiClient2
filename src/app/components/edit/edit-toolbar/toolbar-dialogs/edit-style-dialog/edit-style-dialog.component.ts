import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-style-dialog',
  templateUrl: './edit-style-dialog.component.html',
  styleUrls: ['./edit-style-dialog.component.css']
})
export class EditStyleDialogComponent {
  faX = faX;

  m_sActiveTab: string = "editStyle"
  m_oStyle: any;

  m_oEditStyleForm = {} as {
    sName: string, 
    sDescription: string, 
    bIsPublic: boolean, 
    
  }

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.m_oStyle = data;
  }

  setActiveTab(sTabName: string, event: MouseEvent) {
    event.preventDefault()
    this.m_sActiveTab = sTabName;
  }
}
