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
  /**
   * Array of products for the selected workspace
   */
  @Input() m_aoProducts: Array<any> = [];

  /**
   * Emit selected workspace to parent
   */
  @Output() m_oActiveWorkspaceOutput: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Array of Workspaces owned by the active user
   */
  m_aoWorkspacesList: Array<any> = [];

  /**
   * Currently selected workspace
   */
  m_oActiveWorkspace = null;

  /**
   * Flag to check if the workspace ID was copied to the clipboard
   */
  m_bShowCopied: boolean = false;

  /**
   * Flag to check if the menu is in its expanded or collapsed form
   */
  m_bExpandedMenu: boolean = false;

  /**
   * The search string for filtering workspaces in the expanded menu
   */
  m_sSearchString: string = '';

  /**
   * If the user has written a name that is not included in their WS list - new workspace name
   */
  m_sNewWorkspace: string = null;

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
   * Open New Workspace Dialog or if there is a new workspace string - create the workspace
   */
  openNewWorkspaceDialog(): void {
    if (typeof this.m_sNewWorkspace !== 'string' || FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sNewWorkspace)) {
      this.m_oDialog.open(NewWorkspaceDialogComponent, {
        height: '275px',
        width: '550px'
      });
    } else {
      this.createWorkspace();
    }
  }

  /**
   * Create a new workspace with the m_sNewWorkspace name
   */
  createWorkspace(): void {
    let oNewWorkspace: any;
    this.m_oWorkspaceService.createWorkspace(this.m_sNewWorkspace).subscribe(oResponse => {
      if (oResponse.boolValue === false) {
        this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("MSG_MKT_WS_CREATE_ERROR"), '', 'danger')
      } else {
        oNewWorkspace = this.m_oWorkspaceService.getWorkspaceEditorViewModel(oResponse.stringValue)
        this.m_oConstantsService.setActiveWorkspace(oNewWorkspace)
        this.m_oRouter.navigateByUrl(`edit/${oResponse.stringValue}`);
      }
    })
  }

  /**
   * Set the Active Workspace upon workspace selection (Reveals the Properties Component)
   */
  setActiveWorkspace(oEvent: any): void {
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
  openWorkspace(oWorkspace): void {
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

  deleteWorkspace(oWorkspace, oController): void {
    let sRemoveHeader = this.m_oTranslate.instant("KEY_PHRASES.CONFIRM_REMOVAL");
    let sRemoved = this.m_oTranslate.instant("KEY_PHRASES.REMOVED")
    this.m_oNotificationDisplayService.openConfirmationDialog(`<li>${oWorkspace.workspaceName}</li>`, sRemoveHeader, 'alert').subscribe(oResult => {
      if (oResult === true) {
        oController.m_oWorkspaceService.deleteWorkspace(oWorkspace, true, true).subscribe({
          next: oResponse => {
            if (oResponse === null) {
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
  fetchWorkspaceInfoList(): void {
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
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'danger')
        }
      });
    }
  }

  /**
   * Set new workspace name
   * @param oEvent
   */
  setNewWorkspaceName(oEvent: any): void {
    this.m_sNewWorkspace = oEvent;
  }

  /**
   * Copy the workspace ID to the clipboard
   */
  copyWorkspaceId(): void {
    this.m_oClipboard.copy(this.m_oActiveWorkspace.workspaceId);
    this.m_bShowCopied = true
    setTimeout(() => {
      this.m_bShowCopied = false
    }, 1000)
  }

  /**
   * Toggle the expanded menu (open and closed)
   */
  toggleExpandMenu(): void {
    this.m_bExpandedMenu = !this.m_bExpandedMenu;
  }
}
