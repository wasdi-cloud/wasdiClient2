import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faDownload, faEdit, faLaptopCode, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-workflows-dialog',
  templateUrl: './workflows-dialog.component.html',
  styleUrls: ['./workflows-dialog.component.css']
})
export class WorkflowsDialogComponent implements OnInit {
  //font awesome icons:
  faDownload = faDownload;
  faEdit = faEdit;
  faLaptop = faLaptopCode;
  faPlus = faPlus;
  faX = faX;


  m_aoWorkflows: any[];
  m_aoProducts: any[];
  m_asProductNames: string[];
  m_aoProductClasses: any[];

  m_bIsUploadingWorkflow: boolean = false;
  m_bIsLoadingWorkdlow: boolean = false;

  m_oSelectedWorkflow: any = null;
  m_oSelectedMultiInputWorkflow: any = null;
  m_oWAPProudct: any = null;

  m_oWorkflowFileData = {} as {
    workflowName: "",
    workflowDescription: "",
    isPulic: false
  }

  m_sActiveTab: string = 'execute'
  m_sFilterString: string = "";

  m_sUserId: string;
  m_sWorkspaceId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oMatDialogRef: MatDialogRef<WorkflowsDialogComponent>,
    private m_oWorkflowService: WorkflowService
  ) { }

  ngOnInit(): void {
    this.getWorkflowsByUser()
    this.m_sUserId = this.m_oConstantsService.getUserId();
    this.m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_aoProducts = this.m_oData.products;
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  getWorkflowsByUser() {
    this.m_oWorkflowService.getWorkflowsByUser().subscribe({
      next: oResponse => {
        if (oResponse.body) {
          console.log(oResponse.body)
          this.m_aoWorkflows = oResponse.body
        }
      },
      error: oError => { }
    })
  }

  isWorkflowOwner(oWorkflow) {
    if (!oWorkflow || !this.m_sUserId) {
      return false;
    }

    if (this.m_sUserId === oWorkflow.userId) {
      return true;
    }

    return false;
  }

  setSelectedWorkflow() { }

  openEditWorkflowDialog() { }

  removeWorkflow(oWorkflow) {

    if (!oWorkflow) {
      return false;
    }
    let oDialogData = new ConfirmationDialogModel("Confirm Removal", "Are you sure you want to delete " + oWorkflow.name);
    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      data: oDialogData
    });

    oDialogRef.afterClosed().subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oWorkflowService.deleteWorkflow(oWorkflow.workflowId).subscribe({
          next: oResponse => {
            console.log(oResponse);
            this.getWorkflowsByUser();

          },
          error: oError => { }
        });
      }
    })

    return true
  }

  downloadWorkflow(oWorkflow) {
    if (!oWorkflow) {
      return false;
    }
    this.m_oWorkflowService.downloadWorkflow(oWorkflow.workflowId);
    return true;
  }

  runWorkflowPerProducts() { }

  runMultiInputWorkflow() {

  }

  getObjectExecuteGraph(sWorkflowId: string, sName: string, sDescription: string, asInputNodeName: Array<string>, asInputFileNames: Array<string>,) { }

  onDismiss() {
    this.m_oMatDialogRef.close()
  }
}
