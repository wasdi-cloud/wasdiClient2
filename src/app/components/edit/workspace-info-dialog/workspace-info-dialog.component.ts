import { Component, Inject } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { NodeService } from 'src/app/services/api/node.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-workspace-info-dialog',
  templateUrl: './workspace-info-dialog.component.html',
  styleUrls: ['./workspace-info-dialog.component.css']
})
export class WorkspaceInfoDialogComponent {
  m_sWorkspaceId: string;
  m_oCountProduct: any;
  m_aoNodesList: any[] = [];
  m_asNodeCodes: string[];
  m_asCloudProvider: string[];
  m_sCurrentNode: string;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oNodeService: NodeService,
    @Inject(MAT_DIALOG_DATA) public m_oWorkspace: Workspace,
    private m_oWorkspaceService: WorkspaceService,
  ) {
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

  setNodeVode(oNode: any) {
    this.m_sCurrentNode = oNode;
  }

  saveNodeCode() {
    this.m_oWorkspace.nodeCode = this.m_sCurrentNode;
    let oWorkspace;

    this.m_oWorkspaceService.updateWorkspace(this.m_oWorkspace).subscribe(oResponse => {
      oWorkspace = oResponse;
      if (oWorkspace !== null) {
        this.m_oConstantsService.getActiveWorkspace().nodeCode = this.m_sCurrentNode;
        this.m_oConstantsService.setActiveWorkspace(oWorkspace);

        //Update Successful Dialog
        console.log("success")
      } else {
        //Update Unsucessful Dialog
        console.log("unsuccessful")
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
}
