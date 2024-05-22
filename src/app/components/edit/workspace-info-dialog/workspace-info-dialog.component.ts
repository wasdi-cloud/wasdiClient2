import { Component, Inject, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { NodeService } from 'src/app/services/api/node.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';

@Component({
  selector: 'app-workspace-info-dialog',
  templateUrl: './workspace-info-dialog.component.html',
  styleUrls: ['./workspace-info-dialog.component.css']
})
export class WorkspaceInfoDialogComponent implements OnInit {
  m_sWorkspaceId: string;
  m_oCountProduct: any;
  m_aoNodesList: any[] = [];
  m_asNodeCodes: string[];
  m_asCloudProvider: string[];
  m_sCurrentNode: string;
  m_bShowCopied: boolean = false;

  m_sInputWorkspaceName: string = ""

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oWorkspace: Workspace,
    private m_oClipboard: Clipboard,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<WorkspaceInfoDialogComponent>,
    private m_oNodeService: NodeService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oWorkspaceService: WorkspaceService,
  ) { }

  ngOnInit(): void {
    this.m_oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    this.m_sWorkspaceId = this.m_oWorkspace.workspaceId;
    this.getNodesList()
  }

  /**
   * Extract an array of strings from the node list
   */
  getNodesList() {
    this.m_oNodeService.getNodesList().subscribe(oResponse => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
        oResponse.forEach(oNode => {
          this.m_aoNodesList.push(oNode)
        });
        this.m_asNodeCodes = this.m_aoNodesList.map(oNode => {
          return oNode.nodeCode
        });

      }
    })

  }
  /**
   * Extract an array of strings from the node list
   */
  getCloudProvider() {
    this.m_asCloudProvider = this.m_aoNodesList.map(oNode => {
      return oNode.cloudProvider
    })
    this.m_asCloudProvider.push("wasdi");
  }

  getLastTouchDate() {
    if (this.m_oWorkspace === null) {
      return "";
    } else {
      return new Date(this.m_oWorkspace.lastEditDate).toString().replace("\"", "");
    }
  }

  setNodeCode(oNode: any) {
    this.m_sCurrentNode = oNode.value;
  }

  saveNodeCode() {
    this.m_oWorkspace.nodeCode = this.m_sCurrentNode;
    let oWorkspace;

    this.m_oWorkspaceService.updateWorkspace(this.m_oWorkspace).subscribe(oResponse => {
      oWorkspace = oResponse;
      if (oWorkspace !== null) {
        this.m_oConstantsService.getActiveWorkspace().nodeCode = this.m_sCurrentNode;
        this.m_oConstantsService.setActiveWorkspace(oWorkspace);

        this.m_oNotificationDisplayService.openSnackBar("Node Updated", "Close");
      } else {
        this.m_oNotificationDisplayService.openAlertDialog("Error updating node");
      }
    })
  }

  getSLALink() {
    if (this.m_oWorkspace === null) {
      return "";
    } else {
      if (!this.m_oWorkspace.slaLink) {
        return ""
      } else {
        return this.m_oWorkspace.slaLink;
      }
    }
  }

  setNodeInput(oEvent: any) {
    let sSelectedNode = oEvent.target.value;
    this.m_sCurrentNode = sSelectedNode;
  }

  copyWorkspaceId() {
    this.m_oClipboard.copy(this.m_oWorkspace.workspaceId);
    this.m_bShowCopied = true
    setTimeout(() => {
      this.m_bShowCopied = false
    }, 1000)

  }

  openShareDialog() {
    let oDialogData = new ShareDialogModel("workspace", this.m_oConstantsService.getActiveWorkspace())
    let oDialog = this.m_oDialog.open(ShareDialogComponent, {
      height: '70vh',
      width: '70vw',
      data: oDialogData
    })

    oDialog.afterClosed().subscribe(oResult => {
      this.m_oWorkspaceService.getWorkspaceEditorViewModel(this.m_sWorkspaceId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog("Error in refreshing Workspace Information")
          } else {
            this.m_oWorkspace = oResponse;
          }
        }
      })
    })
  }

  saveNameChange() {
    console.log(this.m_sInputWorkspaceName)
    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    oWorkspace.name = this.m_sInputWorkspaceName
    this.m_oWorkspaceService.updateWorkspace(oWorkspace).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Workspace Name Updated", "Close");
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error while updating worksapce name");
      }
    })

  }

  saveChanges() {
    this.saveNodeCode();
    this.saveNameChange();

  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
