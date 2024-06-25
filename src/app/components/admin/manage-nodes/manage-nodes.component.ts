import { Component, OnInit } from '@angular/core';

import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NodeService } from 'src/app/services/api/node.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';

@Component({
  selector: 'app-manage-nodes',
  templateUrl: './manage-nodes.component.html',
  styleUrls: ['./manage-nodes.component.css']
})
export class ManageNodesComponent implements OnInit {
  m_aoNodes: Array<any> = [];

  m_aoNodesWithScores: Array<any> = [];

  m_bEditMode: boolean = false;

  m_oSelectedNode: any = null;

  m_sSearch: string = null;
  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oNodeService: NodeService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService
  ) { }

  ngOnInit(): void {
    this.getNodes();
    this.getNodesSortedByScore();
  }

  getNodes() {
    this.m_oNodeService.getFullNodesList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Could not get node information");
        } else {
          this.m_aoNodes = oResponse;
        }
      },
      error: oError => { }
    })
  }

  setSelectedNode(oNode: any) {
    this.m_oSelectedNode = oNode;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oNode)) {
      this.m_bEditMode = true;
      this.getNodeDetails();
    } else {
      this.m_oSelectedNode = {};
      this.m_bEditMode = false;
    }
  }

  getNodeDescription(oEvent) {
    if (oEvent.target.value) { 
      this.m_oSelectedNode.nodeDescription = oEvent.target.value;
    }
  }

  updateNode() {
    this.m_oNotificationDisplayService.openConfirmationDialog("Are you sure you want to update this node?").subscribe(bDialogResult => {
      if (bDialogResult) {
        this.m_oNodeService.updateNode(this.m_oSelectedNode).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar("Node updated", "Success", 'success-snackbar')
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(oError.message, 'Error', 'danger')
          }
        })
      }
    })
  }

  createNode() {
    this.m_oNodeService.createNode(this.m_oSelectedNode).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Node Created", "Success", "success-snackbar")
        this.getNodes();
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(oError.message, 'Error', 'danger')
      }
    })
  }

  getNodesSortedByScore() {
    this.m_oProcessWorkspaceService.getAvailableNodesSortedByScore().subscribe({
      next: oResponse => {
        this.m_aoNodesWithScores = oResponse;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(oError.message, 'Error', 'danger')
      }
    })
  }

  getNodeDetails() {
    this.m_oNodeService.getNodeDetails(this.m_oSelectedNode.nodeCode).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error getting Node Information");
        } else {
          this.m_oSelectedNode = oResponse;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(oError.message, 'Error', 'danger')
      }
    })
  }

  getCheckedValue(oEvent, sLabel) {
    if (sLabel === 'shared') {
      this.m_oSelectedNode.shared = oEvent.target.checked;
    } else {
      this.m_oSelectedNode.active = oEvent.target.checked;
    }
  }
}
