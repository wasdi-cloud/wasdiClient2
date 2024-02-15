import { Component, Inject, Input, OnInit } from '@angular/core';

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { faX } from '@fortawesome/free-solid-svg-icons';

import { ConstantsService } from 'src/app/services/constants.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { Workspace } from 'src/app/shared/models/workspace.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
@Component({
  selector: 'app-workspaces-list-dialog',
  templateUrl: './workspaces-list-dialog.component.html',
  styleUrls: ['./workspaces-list-dialog.component.css']
})
export class WorkspacesListDialogComponent implements OnInit {
  //Font Awesome Icons: 
  faX = faX;

  @Input() m_bIsDialog: boolean = true;

  m_aoWorkspaceList: Array<any> = [];
  m_aoSelectedWorkspaces: Array<any> = [];

  m_oActiveWorkspace: Workspace = {} as Workspace;

  m_sCurrentNode: string = '';
  m_sExcludedWorkspaceId: string = '';

  m_oSelectedProduct: any = null;
  m_aoSelectedProducts: Array<any> = [];

  m_bIsLoadingWorkspaceList: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<WorkspacesListDialogComponent>,
    private m_oFileBufferService: FileBufferService,
    private m_oNotificationDisplayService: NotificationDisplayService,
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
    }
    if (this.m_oData.products) {
      this.m_aoSelectedProducts = this.m_oData.products;
    }
    console.log(this.m_aoSelectedProducts)
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
          this.m_aoWorkspaceList = oResponse;
          this.m_bIsLoadingWorkspaceList = false;

          // If there is an Active Workspace, move it to the first position to display first:
          if (this.m_oActiveWorkspace.workspaceId && this.m_bIsDialog === true) {
            this.m_aoWorkspaceList.forEach((oWorkspace, iIndex) => {
              if (oWorkspace.workspaceId === this.m_oActiveWorkspace.workspaceId) {
                this.m_aoWorkspaceList.splice(iIndex, 1);
                this.m_aoWorkspaceList.unshift(oWorkspace);
                // Add the workspace to the selected workspaces array:
                this.m_aoSelectedWorkspaces.push(oWorkspace);
                oWorkspace.checked = true;
              }
            })
          }
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
  * @param oEvent
  */
  selectAllWorkspaces(oEvent: any): void {
    if (oEvent.checked === true) {
      this.m_aoSelectedWorkspaces = this.m_aoWorkspaceList;
      this.m_aoWorkspaceList.forEach(oWorkspace => {
        oWorkspace.checked = true;
      })
    } else {
      this.m_aoSelectedWorkspaces = [];
      this.m_aoWorkspaceList.forEach(oWorkspace => {
        oWorkspace.checked = false;
      })
    }
  }

  /**
   * Select one Workspace
   * @param oWorkspace 
   */
  selectWorkspace(event: any, oWorkspace: any): void {
    //If workspace is checked, add it to the Selected Workspaces Array
    if (event.checked === true) {
      this.m_aoSelectedWorkspaces.push(oWorkspace);
    } else {
      //If Workspace is not checked, remove it from the Selected Workspaces Array
      this.deselectWorkspace(oWorkspace);
    }
  }

  /**
   * Deselect one Workspace
   * @param oWorkspace
   */
  deselectWorkspace(oWorkspace): boolean {
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

  /**'
   * Add a single product to a workspace
   */
  addProductToWorkspace(): void {
    let iNumberOfWorkspaces: number = this.m_aoSelectedWorkspaces.length;
    let sErrorMessage = this.m_oTranslate.instant("MSG_ERROR_IMPORTING");
    let oController = this;

    // If the single selected product is null, the user has only selected 1 product from products list - transfer it to the Selected Proudct Object
    if (this.m_aoSelectedProducts.length === 1 && this.m_oSelectedProduct === null) {
      this.m_oSelectedProduct = this.m_aoSelectedProducts[0];
    }

    for (let iWorkspaceIndex = 0; iWorkspaceIndex < iNumberOfWorkspaces; iWorkspaceIndex++) {
      oController.m_oSelectedProduct.isDisabledToDoDownload = true;
      let sUrl: string = this.m_oSelectedProduct.link;
      let oError = function (data, status) {
        oController.m_oNotificationDisplayService.openAlertDialog( sErrorMessage);
        oController.m_oSelectedProduct.isDisabledToDoDownload = false;
      };

      let sBound = "";

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedProduct.bounds) == false) {
        sBound = this.m_oSelectedProduct.bounds.toString();
      }
      this.downloadProduct(sUrl, this.m_oSelectedProduct.title, this.m_aoSelectedWorkspaces[iWorkspaceIndex].workspaceId, sBound, this.m_oSelectedProduct.provider, null, oError);
    }
    this.onDismiss();
  }

  addMultipleProductsToWorkspace() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoSelectedProducts)) {
      return false;
    }
    //let sMessage = this.m_oTranslate.instant("MSG_ERROR_IMPORTING");
    let iNumberOfWorkspaces: number = this.m_aoSelectedWorkspaces.length;

    let iNumberOfProducts = this.m_aoSelectedProducts.length;

    for (let iWorkspaceIndex = 0; iWorkspaceIndex < iNumberOfWorkspaces; iWorkspaceIndex++) {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoSelectedWorkspaces[iWorkspaceIndex])) {
        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
          this.m_aoSelectedProducts[iIndexProduct].isDisabledToDoDownload = true;
          let url = this.m_aoSelectedProducts[iIndexProduct].link;
          let oError = function (data, status) {
            //FadeoutUtils.utilsVexDialogAlertTop(sMessage);
            this.m_aoSelectedProducts[iIndexProduct].isDisabledToDoDownload = false;
          }
          this.downloadProduct(url, this.m_aoSelectedProducts[iIndexProduct].title, this.m_aoSelectedWorkspaces[iWorkspaceIndex].workspaceId, this.m_aoSelectedProducts[iIndexProduct].bounds.toString(), this.m_aoSelectedProducts[iIndexProduct].provider, null, oError);
        }
      }
    }
    this.onDismiss();
    return true;
  }

  downloadProduct(sUrl: string, sFileName: string, sWorkspaceId: string, sBounds: string, oProvider: any, oCallback: any, oError: any) {
    let sMessage: string;
    let oController = this;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oCallback) === true) {
      this.m_oTranslate.get('MSG_IMPORTING').subscribe(sResponse => {
        sMessage = sResponse;
      });
      oCallback = function (data, status) {
        oController.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "bottom", "right");
      }
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oError) === true) {
      this.m_oTranslate.get('MSG_ERROR_IMPORTING').subscribe(sResponse => {
        sMessage = sResponse;
      });
      oError = function (data, status) {
        oController.m_oNotificationDisplayService.openAlertDialog( sMessage);
      };
    }
    this.m_oFileBufferService.download(sUrl, sFileName, sWorkspaceId, sBounds, oProvider).subscribe({
      next: oCallback,
      error: oError
    });

  }

  shareProductToWorkspace() {
    let oController = this;
    let aoWorkspaces = this.m_aoSelectedWorkspaces;
    let oProduct = this.m_oSelectedProduct;
    let iNumberOfWorkspaces = aoWorkspaces.length;

    let sMessage = this.m_oTranslate.instant("MSG_SHARE_WITH_WS");
    let sErrorMessage = this.m_oTranslate.instant("MSG_ERROR_SHARING");

    for (var iIndexWorkspace = 0; iIndexWorkspace < iNumberOfWorkspaces; iIndexWorkspace++) {

      oProduct.isDisabledToDoDownload = true;
      var sUrl = oProduct.link;
      var oError = function (data, status) {
        oController.m_oNotificationDisplayService.openAlertDialog( sErrorMessage);
        oProduct.isDisabledToDoDownload = false;
      };

      var sBound = "";

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.bounds) == false) {
        sBound = oProduct.bounds.toString();
      }
      //                oThat.shareProduct(sUrl,oProduct.title, aoWorkspaces[iIndexWorkspace].workspaceId,sBound,oProduct.provider,null,oError);
      let sOriginWorkspaceId = oController.m_oActiveWorkspace.workspaceId;
      let sDestinationWorkspaceId = aoWorkspaces[iIndexWorkspace].workspaceId;
      let sProductName = oProduct.fileName;

      oController.m_oFileBufferService.share(sOriginWorkspaceId, sDestinationWorkspaceId, sProductName).subscribe({
        next: oResponse => {
          oController.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom")
        },
        error: oError => {
          oController.m_oNotificationDisplayService.openAlertDialog( sErrorMessage);
        }
      });
    }
  }

  /**
   * Close Dialog Window
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
