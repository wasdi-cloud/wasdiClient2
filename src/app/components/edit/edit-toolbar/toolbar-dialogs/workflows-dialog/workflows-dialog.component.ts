import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faDownload, faEdit, faLaptopCode, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { ConstantsService } from 'src/app/services/constants.service';

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

  m_sUserId: string;

  m_sActiveTab: string = 'execute'

  m_aoWorkflows: any;
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oMatDialogRef: MatDialogRef<WorkflowsDialogComponent>,
    private m_oWorkflowService: WorkflowService
  ) {
    this.getWorkflows();
    this.m_sUserId = this.m_oConstantsService.getUserId();
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  isWorkflowOwner(oWorkflow) {
    if(!oWorkflow || !this.m_sUserId) {
      
      return false;
    }

    if(this.m_sUserId === oWorkflow.userId) {
      console.log(oWorkflow)
      return true; 
    }

    return false; 
  }

  getWorkflows() {
    this.m_oWorkflowService.getWorkflowsByUser().subscribe(oResponse => {
      console.log(oResponse)
      this.m_aoWorkflows = oResponse
    })
  }

  onDismiss() {
    this.m_oMatDialogRef.close()
  }
}
