import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-new-workspace-dialog',
  templateUrl: './new-workspace-dialog.component.html',
  styleUrls: ['./new-workspace-dialog.component.css']
})
export class NewWorkspaceDialogComponent implements OnInit {
  m_bIsEditingWorkspaceName: boolean = false;
  m_oInputWorkspace: Workspace = null;
  m_sWorkspaceName: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<NewWorkspaceDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngOnInit(): void {
    if (this.m_oData) {
      console.log(this.m_oData);
      if (this.m_oData.renameWorkspace) {
        this.m_bIsEditingWorkspaceName = true;
        this.m_oInputWorkspace = this.m_oData.workspace;
        this.m_sWorkspaceName = this.m_oData.workspace.name;
      }
    }
  }

  onCreateWorkspace() {
    let oNewWorkspace;
    if (!this.m_sWorkspaceName) {

    }
    this.m_oWorkspaceService.createWorkspace(this.m_sWorkspaceName).subscribe(oResponse => {
      if (oResponse.boolValue === false) {
        console.log("error")
        return false;
      }
      oNewWorkspace = this.m_oWorkspaceService.getWorkspaceEditorViewModel(oResponse.stringValue)
      this.m_oConstantsService.setActiveWorkspace(oNewWorkspace)
      this.m_oRouter.navigateByUrl(`edit/${oResponse.stringValue}`);
      this.m_oDialogRef.close();
      return true;
    })
  }

  onRenameWorkspace() {
    let sErrorMsg = this.m_oTranslate.instant("DIALOG_ADD_NEW_WORKSPACE_UPDATE_ERROR");
    let sMessge = this.m_oTranslate.instant("DIALOG_ADD_NEW_WORKSPACE_UPDATE_SUCCESS");
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sWorkspaceName) === false) {
      this.m_oInputWorkspace.name = this.m_sWorkspaceName;
      this.m_oWorkspaceService.updateWorkspace(this.m_oInputWorkspace).subscribe({
        next: oResponse => {
          this.m_oNotificationDisplayService.openSnackBar(sMessge, "Close", "right", "bottom");
          this.m_oConstantsService.setActiveWorkspace(this.m_oInputWorkspace);
          this.onDismiss();
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
        }
      });
    }
  }

  /**
   * Execute Search/Rename on Enter Key Input
   * @param oEvent 
   */
  onWorkspaceInput(oEvent: any) {
    if (oEvent.keyCode === 13) {
      if (this.m_bIsEditingWorkspaceName === false) {
        this.onCreateWorkspace();
      } else if (this.m_bIsEditingWorkspaceName === true) {
        this.onRenameWorkspace();
      }
    }
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
