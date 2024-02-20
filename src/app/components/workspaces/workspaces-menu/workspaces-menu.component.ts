import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewWorkspaceDialogComponent } from '../new-workspace-dialog/new-workspace-dialog.component';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-workspaces-menu',
  templateUrl: './workspaces-menu.component.html',
  styleUrls: ['./workspaces-menu.component.css']
})
export class WorkspacesMenuComponent implements OnInit {
  m_aoWorkspacesList: Array<any> = [];

  m_oActiveWorkspace = null;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngOnInit(): void {
    this.fetchWorkspaceInfoList();
  }

  /**
   * Open New Workspace Dialog (re-routes to open editor if user creates workspace)
   */
  openNewWorkspaceDialog() {
    this.m_oDialog.open(NewWorkspaceDialogComponent);
  }

  /**
   * Set the Active Workspace upon workspace selection (Reveals the Properties Component)
   */
  setActiveWorkspace(oEvent: any) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oEvent.value.workspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_oActiveWorkspace = oResponse;
        }
      }
    })
  }

  /**
   * Open the Workspace and re-direct user to the open editor
   * @param oWorkspace 
   */
  openWorkspace(oWorkspace) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error in opening " + oWorkspace.workspaceName);
        } else {
          this.m_oRouter.navigateByUrl(`edit/${oResponse.workspaceId}`);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in opening " + oWorkspace.workspaceName);
      }
    })
  }

  deleteWorkspace(oWorkspace, oController) {
    this.m_oNotificationDisplayService.openConfirmationDialog("Are you sure you want to delete " + oWorkspace.workspaceName).subscribe(oResult => {
      if (oResult === true) {
        oController.m_oWorkspaceService.deleteWorkspace(oWorkspace, true, true).subscribe({
          next: oReponse => {
            if (oReponse === null) {
              oController.m_oNotificationDisplayService.openSnackBar(`Removed ${oWorkspace.workspaceName}`, "Close", "right", "bottom");
              oController.m_oActiveWorkspace = null;
              oController.fetchWorkspaceInfoList();
            }
          }
        })
      }
    })
  }

  /**
 * Get the list of available workspaces
 */
  fetchWorkspaceInfoList() {
    let sMessage: string;
    this.m_oTranslate.get("MSG_MKT_WS_OPEN_ERROR").subscribe(sResponse => {
      sMessage = sResponse
    })

    let oUser: any = this.m_oConstantsService.getUser();

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oUser) === false) {

      this.m_oWorkspaceService.getWorkspacesInfoListByUser().subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog(sMessage);
          } else {
            this.m_aoWorkspacesList = oResponse;
          }
        },
        error: oError => { }
      });
    }
  }
}
