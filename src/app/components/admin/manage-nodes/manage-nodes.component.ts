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

  m_oSelectedNode: any = null;
  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oNodeService: NodeService,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) { }

  ngOnInit(): void {
    this.getNodes();
  }

  getNodes() {
    this.m_oNodeService.getNodesList().subscribe({
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
    this.getNodeDetails();
  }

  updateNode() { }

  deleteNode() { }

  getNodeDetails() {
    this.m_oNodeService.getNodeDetails(this.m_oSelectedNode.nodeCode).subscribe({
      next: oResponse => { console.log(oResponse) },
      error: oError => { }
    })
  }
}
