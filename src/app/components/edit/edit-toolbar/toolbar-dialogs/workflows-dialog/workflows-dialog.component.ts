import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faDownload, faEdit, faLaptopCode, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Workflow } from 'src/app/shared/models/workflow.model';
import { Product } from 'src/app/shared/models/product.model';
import { FormControl } from '@angular/forms';

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

  m_oSelectedWorkflow: Workflow = {} as Workflow;
  m_oSelectedMultiInputWorkflow: any = null;
  m_oWAPProudct: any = null;
  m_oSelectedProduct: Product;
  m_aoSelectedProducts: Array<Product>;

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

  setSelectedWorkflow(oWorkflow) {
    this.m_oSelectedWorkflow = oWorkflow;
  }

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

  /**
   * Execute processing on single product input (Previously: runMultiInputWorkflow)
  */
  runSingleInputWorkflow() {
    // this.addProductInputInNode();  
    let oSnapWorkflowViewModel = this.getObjectExecuteGraph(this.m_oSelectedWorkflow);
    console.log(oSnapWorkflowViewModel);
    if (!oSnapWorkflowViewModel) {
      console.log("Error in executing workflow");
      return false
    } else {
      this.executeGraphFromWorkflowId(this.m_sWorkspaceId, oSnapWorkflowViewModel);
      return true;
    }

  }

  /**
   * Execute processing on multiple product input (Previously: runWorkflowPerProducts)
  */
  runMultiInputWorkflow() {
    let iNumberOfProducts = this.m_aoSelectedProducts.length;
    console.log(this.m_aoSelectedProducts);
    for (let iSelectedProductIndex = 0; iSelectedProductIndex < iNumberOfProducts; iSelectedProductIndex++) {
      let aoSingleInputFiles: Array<string> = [];
      aoSingleInputFiles.push(this.m_oSelectedWorkflow.inputFileNames[iSelectedProductIndex]);

      let oSnapWorkflowViewModel = this.getObjectExecuteGraph(this.m_oSelectedWorkflow)
      if(oSnapWorkflowViewModel) {
        this.executeGraphFromWorkflowId(this.m_sWorkspaceId, oSnapWorkflowViewModel);
      } else {
        console.log("Error in executing workflow");
      }
    }

  }

  getObjectExecuteGraph(oWorkflow: Workflow, asInputFile?: Array<string>) {
    if (this.areOkDataExecuteGraph(oWorkflow.workflowId, oWorkflow.name, oWorkflow.inputNodeNames, oWorkflow.inputFileNames) === false) {
      return null;
    }
    var oExecuteGraph = this.getEmptyObjectExecuteGraph();
    oExecuteGraph.workflowId = oWorkflow.workflowId;
    oExecuteGraph.name = oWorkflow.name;
    oExecuteGraph.description = oWorkflow.description;
    oExecuteGraph.inputNodeNames = oWorkflow.inputNodeNames;
    if (asInputFile) {
      oExecuteGraph.inputFileNames = asInputFile;
    } else {
      oExecuteGraph.inputFileNames = oWorkflow.inputFileNames;
    }
    oExecuteGraph.outputNodeNames = oWorkflow.outputNodeNames;
    oExecuteGraph.outputFileNames = oWorkflow.outputFileNames;
    return oExecuteGraph;
  }

  areOkDataExecuteGraph(sWorkflowId: string, sName: string, asInputNodeNames: Array<string>, asInputFileNames: Array<string>) {
    let bReturnValue: boolean = true;

    if (!sWorkflowId || !sName || !asInputNodeNames || !asInputFileNames) {
      bReturnValue = false;
    }

    return bReturnValue;
  }

  addProductInputInNode() {

  }

  /**
   * Set the value of the inputFileNames in the SelectedWorkflow based on SINGLE selection prodcut input
   * @param oEvent 
   */
  getSingleSelection(oEvent: any) {
    console.log(oEvent.value);
    if (oEvent.value) {
      //Set the inputFileName value to reflect SINGLE input: 
      this.m_oSelectedWorkflow.inputFileNames = [oEvent.value.name];
      console.log(this.m_oSelectedWorkflow);
    }
  }

  /**
   * Set the value of the inputFileNames in the SelectedWorkflow based on MULTIPLE selection product input
   * @param oEvent 
   */
  getMultiSelection(oEvent: any) {
    let asProductNames = [];
    oEvent.value.forEach(oProduct => {
      asProductNames.push(oProduct.fileName);
    });
    this.m_oSelectedWorkflow.inputFileNames = asProductNames;
  }

  getEmptyObjectExecuteGraph() {
    return {
      workflowId: "",
      name: "",
      description: "",
      inputNodeNames: [],
      inputFileNames: [],
      outputNodeNames: [],
      outputFileNames: []
    }
  }

  executeGraphFromWorkflowId(sWorkspaceId: string, oWorkflowObject: any) {
    if (!sWorkspaceId) {
      return false;
    }
    if (!oWorkflowObject) {
      return false;
    }

    this.m_oWorkflowService.executeGraphFromWorkflowId(sWorkspaceId, oWorkflowObject).subscribe({
      next: oResponse => {
        console.log(oResponse);
        if (oResponse.boolValue === true) {
          this.onDismiss();
        } else {
          //ADD ALERT DIALOG: 
          console.log("ERROR IN EXECUTING WORKFLOW");
        }
      },
      error: oError => {
        //ALERT DIALOG: 
        console.log(oError);
      }
    });
    return true;
  }

  onDismiss() {
    this.m_oMatDialogRef.close()
  }
}
