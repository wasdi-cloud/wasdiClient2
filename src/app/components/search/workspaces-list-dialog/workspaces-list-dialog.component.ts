import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-workspaces-list-dialog',
  templateUrl: './workspaces-list-dialog.component.html',
  styleUrls: ['./workspaces-list-dialog.component.css']
})
export class WorkspacesListDialogComponent implements OnInit {
  //Font Awesome Icons: 
  faX = faX;

  m_aoWorkspaceList: Array<any> = [];
  m_aoSelectedWorkspaces: Array<any> = [];

  m_oActiveWorkspace: Workspace = {} as Workspace;

  m_sCurrentNode: string = '';
  m_sExcludedWorkspaceId: string = '';

  m_oSelectedProduct: any = null;

  m_bIsLoadingWorkspaceList: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<WorkspacesListDialogComponent>,
    private m_oFileBufferService: FileBufferService,
    private m_oTranslate: TranslateService,
    private m_oWorkflowsService: WorkflowService,
    private m_oWorkspaceService: WorkspaceService
  ) {

  }

  ngOnInit(): void {
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    this.getWorkspaces();
    this.getWorkflowsByUser();
    if (this.m_oData.product) {
      this.m_oSelectedProduct = this.m_oData.product;
      console.log(this.m_oSelectedProduct);
    }
  }

  /********** API CALLS **********/

  /**
   * Get all Workspaces from the server
   */
  getWorkspaces() {
    this.m_bIsLoadingWorkspaceList = true;

    this.m_oWorkspaceService.getWorkspacesInfoListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          console.log(oResponse);
          this.m_aoWorkspaceList = oResponse;
          this.m_bIsLoadingWorkspaceList = false;
        }
      },
      error: oError => { }
    })
  }

  /**
   * Get user's workflows from the server
   */
  getWorkflowsByUser() { }

  /********** Workspace Selection Handlers **********/

  /**
  * Select all Workspaces
  */
  selectAllWorkspaces() {

  }

  /**
   * Select one Workspace
   * @param oWorkspace 
   */
  selectWorkspace(event: any, oWorkspace: any) {
    //If workspace is checked, add it to the Selected Workspaces Array
    if (event.checked === true) {
      this.m_aoSelectedWorkspaces.push(oWorkspace);
      console.log(this.m_aoSelectedWorkspaces);
    } else {
      //If Workspace is not checked, remove it from the Selected Workspaces Array
      this.deselectWorkspace(oWorkspace);
    }
  }
  /**
   * Deselect All Workspaces
   */
  deselectAllWorkspaces() { }

  /**
   * Deselect one Workspace
   * @param oWorkspace
   */
  deselectWorkspace(oWorkspace) {
    //Search for Workspace in Selected Workspaces Array
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) === true) {
      return false;
    }

    let aoFilteredArray = this.m_aoSelectedWorkspaces.filter(oWorkspaceModel => {
      return oWorkspaceModel.workspaceId !== oWorkspace.workspaceId;
    })

    this.m_aoSelectedWorkspaces = aoFilteredArray;
    return true;
  }

  addSelectedToWorkspace() {
    let iNumberOfWorkspaces: number = this.m_aoSelectedWorkspaces.length;

    for (let iWorkspaceIndex = 0; iWorkspaceIndex < iNumberOfWorkspaces; iWorkspaceIndex++) {
      this.m_oSelectedProduct.isDisabledToDoDownload = true;
      let sUrl: string = this.m_oSelectedProduct.link;
      let oError = function (data, status) {
        //utilsVexDialogAlertTop(sErrorMessage);
        this.m_oSelectedProduct.isDisabledToDoDownload = false;
      };

      let sBound = "";

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedProduct.bounds) == false) {
        sBound = this.m_oSelectedProduct.bounds.toString();
      }
      this.downloadProduct(sUrl, this.m_oSelectedProduct.title, this.m_aoSelectedWorkspaces[iWorkspaceIndex].workspaceId, sBound, this.m_oSelectedProduct.provider, null, oError);
    }
  }

  downloadProduct(sUrl: string, sFileName: string, sWorkspaceId: string, sBounds: string, oProvider: any, oCallback: any, oError: any) {
    let sMessage: string;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oCallback) === true) {
      this.m_oTranslate.get('MSG_IMPORTING').subscribe(sResponse => {
        sMessage = sResponse;
      });
      oCallback = function (data, status) {
        console.log(sMessage)
        //var oDialog = FadeoutUtils.utilsVexDialogAlertBottomRightCorner(sMessage);
        //FadeoutUtils.utilsVexCloseDialogAfter("3000", oDialog);
      }
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oError) === true) {
      this.m_oTranslate.get('MSG_ERROR_IMPORTING').subscribe(sResponse => {
        sMessage = sResponse;
      });
      oError = function (data, status) {
        console.log(sMessage);
        //FadeoutUtils.utilsVexDialogAlertTop(sMessage);
        // oProduct.isDisabledToDoDownload = false;
      };
    }
    this.m_oFileBufferService.download(sUrl, sFileName, sWorkspaceId, sBounds, oProvider).subscribe({
      next: oCallback,
      error: oError
    });

  }

  /**
   * Close Dialog Window
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
