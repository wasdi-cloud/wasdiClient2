import { Component, OnInit } from '@angular/core';

import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NodeService } from 'src/app/services/api/node.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-manage-nodes',
  templateUrl: './manage-nodes.component.html',
  styleUrls: ['./manage-nodes.component.css']
})
export class ManageNodesComponent implements OnInit {
  m_aoNodes: Array<any> = [];

  m_bEditMode: boolean = false;

  m_oSelectedNode: any = null;

  m_sSearch: string = null; 
  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oNodeService: NodeService,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) { }

  ngOnInit(): void {
    this.getNodes();
  }

  getNodes() {
    this.m_oNodeService.getFullNodesList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Could not get node information");
        } else {
          this.m_aoNodes = oResponse;
          console.log(this.m_aoNodes)
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

  updateNode() {
    this.m_oNotificationDisplayService.openConfirmationDialog("Are you sure you want to update this node?").subscribe(bDialogResult => {
      if (bDialogResult) {
        this.m_oNodeService.updateNode(this.m_oSelectedNode).subscribe({
          next: oResponse => {
            console.log(oResponse)
          }
        })
      }
    })
  }

  createNode() {
    this.m_oNodeService.createNode(this.m_oSelectedNode).subscribe({
      next: oResponse => {
        console.log(oResponse);
        this.getNodes();
      },
      error: oError => { }
    })
  }

  getNodeDetails() {
    this.m_oNodeService.getNodeDetails(this.m_oSelectedNode.nodeCode).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error getting Node Information");
        } else {
          this.m_oSelectedNode = oResponse;
          console.log(this.m_oSelectedNode)
        }
      },
      error: oError => { }
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
