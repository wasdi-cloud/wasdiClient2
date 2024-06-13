import { Component, Inject, Input, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConstantsService } from 'src/app/services/constants.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { Workspace } from 'src/app/shared/models/workspace.model';

import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
  selector: 'app-workspaces-list-dialog',
  templateUrl: './workspaces-list-dialog.component.html',
  styleUrls: ['./workspaces-list-dialog.component.css']
})
export class WorkspacesListDialogComponent implements OnInit {
  /**
   * Flag to check if the workspace list has loaded
   */
  m_bIsLoadingWorkspaceList: boolean = false;

  /**
   * Flag to check if the user is sharing a product (between workspaces) or sending a new product from search
   */
  m_bIsSharingProduct: boolean = false;

  /**
   * The selected products for multi-product sending
   */
  m_aoSelectedProducts: Array<any> = null;

  /**
   * Array of selected workspaces - add active workspace when sending via search
   */
  m_aoSelectedWorkspaces: Array<any> = [];

  /**
   * Array of user's workspaces
   */
  m_aoWorkspaceList: Array<any> = [];

  /**
   * The user's active (open) workspace
   */
  m_oActiveWorkspace: Workspace = {} as Workspace;

  /**
   * The selected product for single selection 
   */
  m_oSelectedProduct: any = null;

  /**
   * Holder for the user's search input
   */
  m_sSearch: string = ""

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<WorkspacesListDialogComponent>,
    private m_oFileBufferService: FileBufferService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

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

    if (this.m_oData.sharing) {
      this.m_bIsSharingProduct = this.m_oData.sharing;
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
          this.m_aoWorkspaceList = oResponse;
          this.m_bIsLoadingWorkspaceList = false;

          // If there is an Active Workspace, move it to the first position to display first:
          if (this.m_oActiveWorkspace.workspaceId && this.m_bIsSharingProduct === false) {
            this.m_aoWorkspaceList.forEach((oWorkspace, iIndex) => {
              if (oWorkspace.workspaceId === this.m_oActiveWorkspace.workspaceId) {
                this.m_aoWorkspaceList.splice(iIndex, 1);
                this.m_aoWorkspaceList.unshift(oWorkspace);
                // Add the workspace to the selected workspaces array:
                this.m_aoSelectedWorkspaces.push(oWorkspace);
                oWorkspace.selected = true
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
    if (oEvent.selected === true) {
      this.m_aoSelectedWorkspaces = this.m_aoWorkspaceList;
      this.m_aoWorkspaceList.forEach(oWorkspace => {
        oWorkspace.selected = true;
      })
    } else {
      this.m_aoSelectedWorkspaces = [];
      this.m_aoWorkspaceList.forEach(oWorkspace => {
        oWorkspace.selected = false;
      })
    }
  }

  /**
   * Select one Workspace
   * @param oWorkspace 
   */
  selectWorkspace(event: any, oWorkspace: any): void {
    oWorkspace.selected = !oWorkspace.selected;
    //If workspace is checked, add it to the Selected Workspaces Array
    if (oWorkspace.selected === true) {
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
        oController.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, oController.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
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
        oController.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar');
      }
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oError) === true) {
      this.m_oTranslate.get('MSG_ERROR_IMPORTING').subscribe(sResponse => {
        sMessage = sResponse;
      });
      oError = function (data, status) {
        oController.m_oNotificationDisplayService.openAlertDialog(sMessage, oController.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
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
    let aoProducts = this.m_aoSelectedProducts;

    let sMessage = this.m_oTranslate.instant("MSG_SHARE_WITH_WS");
    let sErrorMessage = this.m_oTranslate.instant("MSG_ERROR_SHARING");

    for (var iIndexWorkspace = 0; iIndexWorkspace < iNumberOfWorkspaces; iIndexWorkspace++) {
      if (aoProducts) {
        aoProducts.forEach(oProduct => {
          oProduct.isDisabledToDoDownload = true;
          let sUrl = oProduct.link;
          let oError = function (data, status) {
            oController.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, oController.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
            oProduct.isDisabledToDoDownload = false;
          };

          let sBound = "";

          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.bounds) == false) {
            sBound = oProduct.bounds.toString();
          }

          let sOriginWorkspaceId = oController.m_oActiveWorkspace.workspaceId;
          let sDestinationWorkspaceId = aoWorkspaces[iIndexWorkspace].workspaceId;
          let sProductName = oProduct.fileName;

          oController.m_oFileBufferService.share(sOriginWorkspaceId, sDestinationWorkspaceId, sProductName).subscribe({
            next: oResponse => {
              oController.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar')
            },
            error: oError => {
              oController.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, oController.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
            }
          });
        })
      } else if (oProduct) {
        oProduct.isDisabledToDoDownload = true;
        let sUrl = oProduct.link;
        let oError = function (data, status) {
          oController.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, oController.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger');
          oProduct.isDisabledToDoDownload = false;
        };

        let sBound = "";

        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.bounds) == false) {
          sBound = oProduct.bounds.toString();
        }

        let sOriginWorkspaceId = oController.m_oActiveWorkspace.workspaceId;
        let sDestinationWorkspaceId = aoWorkspaces[iIndexWorkspace].workspaceId;
        let sProductName = oProduct.fileName;

        oController.m_oFileBufferService.share(sOriginWorkspaceId, sDestinationWorkspaceId, sProductName).subscribe({
          next: oResponse => {
            oController.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar')
          },
          error: oError => {
            oController.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, oController.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
          }
        });
      }
    }
    this.onDismiss()
  }

  /**
   * Close Dialog Window
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
