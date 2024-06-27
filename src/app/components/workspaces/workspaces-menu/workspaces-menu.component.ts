import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NewWorkspaceDialogComponent } from '../new-workspace-dialog/new-workspace-dialog.component';
import { ConstantsService } from 'src/app/services/constants.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { Clipboard } from '@angular/cdk/clipboard';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-workspaces-menu',
  templateUrl: './workspaces-menu.component.html',
  styleUrls: ['./workspaces-menu.component.css']
})
export class WorkspacesMenuComponent implements OnInit {
  m_aoWorkspacesList: Array<any> = [];

  m_oActiveWorkspace = null;

  m_bShowCopied: boolean = false;

  m_bExpandedMenu: boolean = false;

  @Input() m_aoProducts: Array<any> = [];

  @Output() m_oActiveWorkspaceOutput: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private m_oClipboard: Clipboard,
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
    this.m_oDialog.open(NewWorkspaceDialogComponent, {
      height: '275px',
      width: '550px'
    });
  }

  /**
   * Set the Active Workspace upon workspace selection (Reveals the Properties Component)
   */
  setActiveWorkspace(oEvent: any) {
    this.m_aoWorkspacesList.forEach(oWorkspace => oWorkspace.workspaceId === oEvent.workspaceId ? oWorkspace.selected = true : oWorkspace.selected = false)
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oEvent.workspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_oActiveWorkspace = oResponse;
          this.m_oActiveWorkspace.selected = true;
          this.m_oActiveWorkspaceOutput.emit(this.m_oActiveWorkspace);
        }
      }
    })
  }

  /**
   * Open the Workspace and re-direct user to the open editor
   * @param oWorkspace 
   */
  openWorkspace(oWorkspace) {
    let sError = this.m_oTranslate.instant("MSG_MKT_WS_OPEN_ERROR");
    this.m_oConstantsService.setActiveWorkspace(oWorkspace);
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog(sError, '', 'danger');
        } else {
          this.m_oRouter.navigateByUrl(`edit/${oResponse.workspaceId}`);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sError, '', 'danger');
      }
    })
  }

  deleteWorkspace(oWorkspace, oController) {
    let sRemoveHeader = this.m_oTranslate.instant("KEY_PHRASES.CONFIRM_REMOVAL");
    let sRemoved = this.m_oTranslate.instant("KEY_PHRASES.REMOVED")
    this.m_oNotificationDisplayService.openConfirmationDialog(`<li>${oWorkspace.workspaceName}</li>`, sRemoveHeader, 'alert').subscribe(oResult => {
      if (oResult === true) {
        oController.m_oWorkspaceService.deleteWorkspace(oWorkspace, true, true).subscribe({
          next: oReponse => {
            if (oReponse === null) {
              oController.m_oNotificationDisplayService.openSnackBar(oWorkspace.workspaceName, sRemoved, 'success-snackbar');
              // Clear workspace information displayed in the UI
              oController.m_oActiveWorkspace = null;
              // Refresh workspaces list:
              oController.fetchWorkspaceInfoList();
              // Only clear the workspace in the constants service if it is the one removed:
              if (oWorkspace.workspaceId === this.m_oConstantsService.getActiveWorkspace().workspaceId) {
                oController.m_oConstantsService.setActiveWorkspace(null);
              }
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

  copyWorkspaceId() {
    this.m_oClipboard.copy(this.m_oActiveWorkspace.workspaceId);
    this.m_bShowCopied = true
    setTimeout(() => {
      this.m_bShowCopied = false
    }, 1000)
  }

  toggleExpandMenu() {
    this.m_bExpandedMenu = !this.m_bExpandedMenu;
  }
}
