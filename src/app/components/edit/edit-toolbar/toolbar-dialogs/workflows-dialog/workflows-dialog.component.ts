import { Component, ElementRef, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workflow } from 'src/app/shared/models/workflow.model';
import { Product } from 'src/app/shared/models/product.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { JsonEditorService } from 'src/app/services/json-editor.service';
@Component({
  selector: 'app-workflows-dialog',
  templateUrl: './workflows-dialog.component.html',
  styleUrls: ['./workflows-dialog.component.css']
})
export class WorkflowsDialogComponent implements OnInit {
  @ViewChild('editor') m_oEditorRef!: ElementRef;

  m_aoWorkflows: any[];
  m_aoProducts: any[];
  m_asProductNames: string[];
  m_aoProductClasses: any[];

  m_bIsUploadingWorkflow: boolean = false;
  m_bIsLoadingWorkflow: boolean = false;
  m_bShowExtension: boolean = false;

  m_oSelectedWorkflow: Workflow = {} as Workflow;
  m_oSelectedMultiInputWorkflow: any = null;
  m_oWAPProudct: any = null;
  m_oSelectedProduct: Product;
  m_aoSelectedProducts: Array<Product>;
  m_aoMultiInputSelectedProducts: any = {};

  m_oWorkflowFileData = {} as {
    workflowName: "",
    workflowDescription: "",
    isPulic: false
  }

  m_oFile: any = null;

  m_sActiveTab: string = 'execute'
  m_sFilterString: string = "";

  m_sUserId: string;
  m_sWorkspaceId: string;
  m_sSearchString: string = "";
  m_bIsReadOnly: boolean = true;

  m_bShowInputs: boolean = false;
  m_bCreatingWorkflow: boolean = false;

  m_sWorkflowName: string = "";
  m_sWorkflowDescription: string = "";
  m_bWorkflowIsPublic: boolean = false;

  m_bChangeMade: boolean = false;

  m_sFileName: string = "";

  m_bShowXML: boolean = false;

  m_sJSONParam


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oJsonEditorService: JsonEditorService,
    private m_oDialog: MatDialog,
    private m_oMatDialogRef: MatDialogRef<WorkflowsDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oWorkflowService: WorkflowService
  ) { }

  ngOnInit(): void {
    this.getWorkflowsByUser();
    this.m_sUserId = this.m_oConstantsService.getUserId();
    this.m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_aoProducts = this.m_oData.products;
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor();
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  selectedMultiInputWorkflow(oWorkflow: Workflow) {
    this.m_oSelectedMultiInputWorkflow = oWorkflow;
    // create a dictionary
    this.m_aoMultiInputSelectedProducts = {};
  }

  getWorkflowsByUser() {
    this.m_oWorkflowService.getWorkflowsByUser().subscribe({
      next: oResponse => {
        if (oResponse.body) {
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
    if (this.m_bChangeMade === true) {
      // TODO: ADD NEW FORMAT FOR NOTIFICATION DIALOG
      // sHeader: Edit incomplete
      this.m_oNotificationDisplayService.openConfirmationDialog("The workflow creation is not complete, some fields are missing and the workflow cannot be saved.<br> What do you wish to do?").subscribe(bDialogResult => {
        // False means workflow was discarded
        if (bDialogResult === false) {
          this.m_bCreatingWorkflow = false;
          this.m_bShowInputs = false;
          console.log(this.m_oSelectedWorkflow);
          this.m_oSelectedWorkflow = oWorkflow;
          this.selectedMultiInputWorkflow(oWorkflow);
        }
      })
    } else {
      this.m_bCreatingWorkflow = false;
      this.m_bShowInputs = false;
      this.m_oSelectedWorkflow = oWorkflow;
      this.selectedMultiInputWorkflow(oWorkflow);
    }
  }

  toggleShowInputs(bShowInputs: boolean, bIsEditing: boolean) {
    this.m_bShowInputs = bShowInputs;
    this.m_bCreatingWorkflow = !bIsEditing;
  }

  // openEditWorkflowDialog(oWorkflow?) {
  //   let oDialog;
  //   if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkflow) === false) {
  //     oDialog = this.m_oDialog.open(EditWorkflowDialogComponent, {
  //       height: '70vh',
  //       width: '70vw',
  //       data: {
  //         editMode: true,
  //         workflow: oWorkflow
  //       }
  //     })
  //   } else {
  //     oDialog = this.m_oDialog.open(EditWorkflowDialogComponent, {
  //       height: '70vh',
  //       width: '70vw',
  //       data: {
  //         editMode: false,
  //         workflow: {}
  //       }
  //     })
  //   }
  //   oDialog.afterClosed().subscribe(oDialogResult => {
  //     this.getWorkflowsByUser();
  //   });
  // }
  initWorkflowInfo() {

  }

  uploadWorkflow(sWorkspaceId: string, sName: string, sDescription: string, bIsPublic: boolean, oBody: any) {
    if (!sName) {
      this.m_oNotificationDisplayService.openAlertDialog("Please add a name");
    } else if (!this.m_oFile) {
      this.m_oNotificationDisplayService.openAlertDialog("Please upload a file");
    } else {
      this.m_bIsUploadingWorkflow = true;
      this.m_oWorkflowService.uploadByFile('workspace', sName, sDescription, oBody, bIsPublic).subscribe({
        next: oResponse => {
          let sMessage = "WORKFLOW UPLOADED " + sName.toUpperCase();
          this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom")
          this.getWorkflowsByUser();
          this.m_bShowInputs = false;
          console.log(oResponse)
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("INVALID SNAP FILE!");
        }
      })
    }
  }

  updateWorkflow() {
    if (this.m_sWorkflowDescription === undefined) {
      this.m_sWorkflowDescription = "";
    }
    this.m_oWorkflowService.updateGraphParameters(this.m_oSelectedWorkflow.workflowId, this.m_sWorkflowName, this.m_sWorkflowDescription, this.m_bWorkflowIsPublic).subscribe({
      next: oResponse => {
        this.m_oWorkflowService.updateGraphFile(this.m_oSelectedWorkflow.workflowId, this.m_oFile).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar("GRAPH FILE UPDATED", "Close", "right", "bottom");
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog("Error in updating Graph File");
          }
        })
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in updating Graph File");
      }
    })
  }

  removeWorkflow(oWorkflow) {
    if (!oWorkflow) {
      return false;
    }
    let sConfirmMsg = "Are you sure you want to delete " + oWorkflow.name;
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oWorkflowService.deleteWorkflow(oWorkflow.workflowId).subscribe({
          next: oResponse => {
            this.getWorkflowsByUser();
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog("Error in Removing this Workflow");
          }
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
    //Todo: Add Check for active project/subscription
    if (this.m_bIsReadOnly === true) {
      this.m_oNotificationDisplayService.openAlertDialog("You do not have permission to execute a workflow in this workspace");
      return false;
    }
    // this.addProductInputInNode();  
    for (var sNodeName in this.m_aoMultiInputSelectedProducts) {
      // check if the property/key is defined in the object itself, not in parent
      if (this.m_aoMultiInputSelectedProducts.hasOwnProperty(sNodeName)) {
        this.addProductInputInNode(sNodeName, this.m_aoMultiInputSelectedProducts[sNodeName].name);
      }
    }
    var oSnapWorkflowViewModel = this.getObjectExecuteGraph(this.m_oSelectedMultiInputWorkflow.workflowId, this.m_oSelectedMultiInputWorkflow.name, this.m_oSelectedMultiInputWorkflow.description,
      this.m_oSelectedMultiInputWorkflow.inputNodeNames, this.m_oSelectedMultiInputWorkflow.inputFileNames, this.m_oSelectedMultiInputWorkflow.outputNodeNames,
      this.m_oSelectedMultiInputWorkflow.outputFileNames);
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSnapWorkflowViewModel) === false) {
      this.executeGraphFromWorkflowId(this.m_sWorkspaceId, oSnapWorkflowViewModel);
    } else {
      this.m_oNotificationDisplayService.openAlertDialog("GURU MEDITATION<br>YOU HAVE TO INSERT A PRODUCT FOR EACH INPUT NODE.");
    }
    return true;
  }

  /**
   * Execute processing on multiple product input (Previously: runWorkflowPerProducts)
  */
  runMultiInputWorkflow() {
    if (this.m_bIsReadOnly === true) {
      this.m_oNotificationDisplayService.openAlertDialog("You do not have permission to execute a workflow in this workspace");
      return false;
    }
    let iNumberOfProducts = this.m_aoSelectedProducts.length;
    for (let iSelectedProductIndex = 0; iSelectedProductIndex < iNumberOfProducts; iSelectedProductIndex++) {
      let aoSingleInputFiles: Array<string> = [];
      aoSingleInputFiles.push(this.m_oSelectedWorkflow.inputFileNames[iSelectedProductIndex]);

      let oSnapWorkflowViewModel = this.getObjectExecuteGraph(this.m_oSelectedMultiInputWorkflow.workflowId, this.m_oSelectedMultiInputWorkflow.name, this.m_oSelectedMultiInputWorkflow.description,
        this.m_oSelectedMultiInputWorkflow.inputNodeNames, this.m_oSelectedMultiInputWorkflow.inputFileNames, this.m_oSelectedMultiInputWorkflow.outputNodeNames,
        this.m_oSelectedMultiInputWorkflow.outputFileNames);
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSnapWorkflowViewModel) === false) {
        this.executeGraphFromWorkflowId(this.m_sWorkspaceId, oSnapWorkflowViewModel);
      } else {
        this.m_oNotificationDisplayService.openAlertDialog("GURU MEDITATION<br>YOU HAVE TO INSERT A PRODUCT FOR EACH INPUT NODE.");
      }
    }
    return true;
  }


  getObjectExecuteGraph(sWorkflowId, sName, sDescription, asInputNodeNames,
    asInputFileNames, asOutputNodeNames, asOutputFileNames) {
    if (this.areOkDataExecuteGraph(sWorkflowId, sName, asInputNodeNames, asInputFileNames) === false) {
      return null;
    }
    let oExecuteGraph = this.getEmptyObjectExecuteGraph();
    oExecuteGraph.workflowId = sWorkflowId;
    oExecuteGraph.name = sName;
    oExecuteGraph.description = sDescription;
    oExecuteGraph.inputNodeNames = asInputNodeNames;
    oExecuteGraph.inputFileNames = asInputFileNames;
    oExecuteGraph.outputNodeNames = asOutputNodeNames;
    oExecuteGraph.outputFileNames = asOutputFileNames;

    return oExecuteGraph;
  }

  areOkDataExecuteGraph(sWorkflowId: string, sName: string, asInputNodeNames: Array<string>, asInputFileNames: Array<string>) {
    let bReturnValue: boolean = true;

    if (!sWorkflowId || !sName || !asInputNodeNames || !asInputFileNames) {
      bReturnValue = false;
    }

    return bReturnValue;
  }

  addProductInputInNode(sNode: string, sProduct: string) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sNode) || FadeoutUtils.utilsIsStrNullOrEmpty(sProduct)) {
      return false;
    }

    let iIndexOfElement = FadeoutUtils.utilsFindObjectInArray(this.m_oSelectedMultiInputWorkflow.inputNodeNames, sNode)

    if (iIndexOfElement === -1) {
      return false;
    }

    // TODO: Refactoring del ciclo
    for (let iProducts = 0; iProducts < this.m_aoProducts.length; iProducts++) {
      if (this.m_aoProducts[iProducts].name === sProduct) {
        this.m_oSelectedMultiInputWorkflow.inputFileNames[iIndexOfElement] = this.m_aoProducts[iProducts].fileName;
        break;
      }
    }

    return true;
  }

  /**
   * Set the value of the inputFileNames in the SelectedWorkflow based on SINGLE selection prodcut input
   * @param oEvent 
   */
  getSingleSelection(oEvent: any, oNode: any) {
    if (oEvent.value) {
      //Set the inputFileName value to reflect SINGLE input: 
      this.m_oSelectedWorkflow.inputFileNames = [oEvent.value.name];
    }
  }

  /**
   * Set the value of the inputFileNames in the SelectedWorkflow based on MULTIPLE selection product input
   * @param oEvent 
   */
  getMultiSelection(oEvent: any, oNode: any) {
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
        if (oResponse.boolValue === true) {
          this.onDismiss();
        } else {
          //ADD ALERT DIALOG: 
          this.m_oNotificationDisplayService.openAlertDialog("ERROR IN EXECUTING WORKFLOW");
        }
      },
      error: oError => {
        //ALERT DIALOG: 
        this.m_oNotificationDisplayService.openAlertDialog("ERROR IN EXECUTING WORKFLOW");
      }
    });
    return true;
  }

  handleListItemClick(oEvent, oWorkflow) {
    console.log(oEvent)
    this.setSelectedWorkflow(oWorkflow);
    if (oEvent === 'delete') {
      this.removeWorkflow(oWorkflow);
    } else if (oEvent === 'edit') {
      // this.openEditWorkflowDialog(oWorkflow);
    } else if (oEvent === 'xml') {
      this.showJSONEditor();
    } else if (oEvent === 'share') {
      this.openShareDialog()
    }
    else {
      this.downloadWorkflow(oWorkflow);
    }
  }

  onDismiss() {
    this.m_oMatDialogRef.close()
  }

  getWorkflowImageLink(oWorkflow) {
    return "/assets/icons/style-placeholder.svg"
  }

  getInputChanges(oEvent, sLabel) {
    // this.m_bChangeMade = true;
    switch (sLabel) {
      case 'name':
        this.m_sWorkflowName = oEvent.event.target.value;
        break;
      case 'description':
        this.m_sWorkflowDescription = oEvent.target.value;
        break;
      case 'search':
        this.m_sSearchString = oEvent.event.target.value;
        break;
    }
  }

  getSelectedFile(oEvent) {
    this.m_sFileName = oEvent.name;
    this.m_oFile = oEvent.file
  }

  openShareDialog() {
    let oDialogData = new ShareDialogModel("workflow", this.m_oSelectedWorkflow)
    this.m_oDialog.open(ShareDialogComponent, {
      height: '60vh',
      width: '60vw',
      data: oDialogData
    })
  }

  showJSONEditor() {
    this.m_bShowXML = true

    this.m_oJsonEditorService.initEditor()
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
  }
}
