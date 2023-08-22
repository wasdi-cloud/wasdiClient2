import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-workflow-dialog',
  templateUrl: './edit-workflow-dialog.component.html',
  styleUrls: ['./edit-workflow-dialog.component.css']
})
export class EditWorkflowDialogComponent {
  faX = faX;

  m_oWorkflow;

  m_sActiveTab: string = "workflow";
  m_asWorkflowXML;
  m_bXMLEdited: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oMatDialogRef: MatDialogRef<EditWorkflowDialogComponent>) { 
      this.m_oWorkflow = this.m_oData.workflow; 
    }

  setActiveTab(sActiveTab: string) {
    this.m_sActiveTab = sActiveTab;
  }

  getWorkflowXML() { }

  onDismiss() {
    this.m_oMatDialogRef.close();
  }
}
