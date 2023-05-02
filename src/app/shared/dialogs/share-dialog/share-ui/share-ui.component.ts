import { Component, Input, OnInit } from '@angular/core';
import { faUserPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { StyleService } from 'src/app/services/api/style.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
@Component({
  selector: 'app-share-ui',
  templateUrl: './share-ui.component.html',
  styleUrls: ['./share-ui.component.css']
})
export class ShareUiComponent implements OnInit {
  //Font awesome icons: 
  faUserPlus = faUserPlus
  faTrashCan = faTrash

  m_aoSharedUsers: any;
  m_sUserIdSearch: string;

  @Input() resource: any;
  @Input() resourceType: string;

  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oStyleService: StyleService,
    private m_oWorkspaceService: WorkspaceService) { }

  ngOnInit() {
    this.getEnabledUsers()
  }

  getEnabledUsers() {
    if (this.resourceType && this.resource) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.getUsersBySharedWorkspace(this.resource.workspaceId).subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.getUsersBySharedStyle(this.resource.styleId).subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
          }
        })
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        this.m_oAdminDashboardService.findResourcePermissions(this.resourceType, this.resource.templateId, "").subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
          }
        })
      }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }

  onAddEnabledUser() {
    if (this.resourceType && this.resource && this.m_sUserIdSearch.length !== 0) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.putShareWorkspace(this.resource.workspaceId, this.m_sUserIdSearch).subscribe(oResponse => {
          console.log(oResponse)
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.addStyleSharing(this.resource.styleId, this.m_sUserIdSearch).subscribe(oResponse => {
          console.log(oResponse);
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        this.m_oAdminDashboardService.addResourcePermission(this.resourceType, this.resource.templateId, this.m_sUserIdSearch).subscribe(oResponse => {
          this.getEnabledUsers();
        })
      }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }

  onRemoveEnabledUser(sUserId: string) {
    if (this.resourceType && this.resource) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.deleteUserSharedWorkspace(this.resource.workspaceId, sUserId).subscribe(oResponse => {
          if (oResponse.intValue === 200 && oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.removeStyleSharing(this.resource.styleId, sUserId).subscribe(oResponse => {
          console.log(oResponse)
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        this.m_oAdminDashboardService.removeResourcePermission(this.resourceType, this.resource.templateId, sUserId).subscribe(oResponse => {
          this.getEnabledUsers();
        })
      }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }
}
