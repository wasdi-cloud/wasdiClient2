import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { WorkflowService } from 'src/app/services/api/workflow.service';

@Component({
  selector: 'app-edit-workflow-dialog',
  templateUrl: './edit-workflow-dialog.component.html',
  styleUrls: ['./edit-workflow-dialog.component.css']
})
export class EditWorkflowDialogComponent implements OnInit {
  faX = faX;

  m_bEditMode;
  m_bIsUploadingWorkflow: boolean = false;

  m_oWorkflow;

  m_sActiveTab: string = "workflow";
  m_asWorkflowXML;
  m_bXMLEdited: boolean = false;

  m_sWorkflowName: string;
  m_sWorkflowDescription: string = "";
  m_bWorkflowIsPublic: boolean = false;
  m_oFile: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oMatDialogRef: MatDialogRef<EditWorkflowDialogComponent>,
    private m_oWorkflowService: WorkflowService) {
    this.m_oWorkflow = this.m_oData.workflow;
    this.m_bEditMode = this.m_oData.editMode;
  }

  ngOnInit(): void {
    //Set Workflow inputs if editing existing workflow:
    if (this.m_bEditMode === true) {
      this.m_sWorkflowName = this.m_oWorkflow.name;
      this.m_sWorkflowDescription = this.m_oWorkflow.Description;
      this.m_bWorkflowIsPublic = this.m_oWorkflow.public;
      // this.getWorkflowXML(this.m_oWorkflow.workflowId);
    }
  }

  /**
   * Change the Active tab
   * @param sActiveTab 
   */
  setActiveTab(sActiveTab: string) {
    this.m_sActiveTab = sActiveTab;
  }

  /**
   * Create the m_oFile object when a file is selected in the component
   * @param input 
   */
  onFileSelect(input: any) {
    if (input.files && input.files[0]) {
      this.m_oFile = new FormData();
      this.m_oFile.append('file', input.files[0]);
    }
  }

  /**
   * Monitor input for changes to XML file
   * @param event 
   */
  xmlChanged(event) {
    this.m_bXMLEdited = true;
    console.log(event);
  }

  updateGraph() {
    if (this.m_sWorkflowDescription === undefined) {
      this.m_sWorkflowDescription = "";
    }
    this.m_oWorkflowService.updateGraphParameters(this.m_oWorkflow.workflowId, this.m_sWorkflowName, this.m_sWorkflowDescription, this.m_bWorkflowIsPublic).subscribe({
      next: oResponse => {
        this.m_oWorkflowService.updateGraphFile(this.m_oWorkflow.workflowId, this.m_oFile).subscribe({
          next: oResponse => {
            console.log(oResponse);
          },
          error: oError => {
            console.log(oError);
          }
        })
      },
      error: oError => {
        console.log(oError);
      }
    })
  }

  createNewGraph(sWorkspaceId: string, sName: string, sDescription: string, bIsPublic: boolean, oBody: any) {
    if (!this.m_sWorkflowName) {
      console.log("Please add a name");
    }
    if (!this.m_oFile) {
      console.log("Please upload a file");
    }

    this.m_bIsUploadingWorkflow = true;
    this.m_oWorkflowService.uploadByFile('workspace', sName, sDescription, oBody, bIsPublic).subscribe({
      next: oResponse => {
        console.log(oResponse);
        console.log("WORKFLOW UPLOADED" + sName.toUpperCase())
      },
      error: oError => {
        console.log("INVALID SNAP FILE!");
      }
    })
  }

  /**
   * Fetch the XML file from the server and set XML input
   * @param sWorkflowId 
   */
  getWorkflowXML(sWorkflowId: string) {
    this.m_oWorkflowService.getWorkflowXml(sWorkflowId).subscribe({
      next: oResponse => {
        this.m_asWorkflowXML = oResponse;
      },
      error: oError => {
        console.log(oError);
      }
    });
  }

  updateWorkflowXML() {
    if (this.m_asWorkflowXML) {
      let oBody = new FormData();
      oBody.append('graphXML', this.m_asWorkflowXML);
      this.m_oWorkflowService.postWorkflowXml(this.m_oWorkflow.workflowId, oBody).subscribe({
        next: oResponse => {
          if (oResponse.status === 200) {
            console.log("WORKFLOW XML UPDATED");
          }
        },
        error: oError => {
          console.log(oError);
          if (oError.status === 304) {
            console.log("MODIFICATIONS REJECTED - PLEASE CHECK THE XML");
          } else if (oError.status === 401) {
            console.log("MODIFICATIONS REJECTED - UNAUTHORIZED")
          } else; {
            console.log("INTERNAL SERVER ERROR - PLEASE TRY AGAIN LATER")
          }

        }
      });

    }
  }

  saveWorkflowChanges() {
    if (this.m_bXMLEdited === true && this.m_sActiveTab === 'xml') {
      //this.updateWorkflowXML();
    }
    if (this.m_sActiveTab === 'workflow') {
      if (this.m_bEditMode === true) {
        this.updateGraph();
      } else {
        this.createNewGraph('workspaceId', this.m_sWorkflowName, this.m_sWorkflowDescription, this.m_bWorkflowIsPublic, this.m_oFile);
      }
    }
    this.onDismiss();
  }

  onDismiss() {
    this.m_oMatDialogRef.close();
  }
}