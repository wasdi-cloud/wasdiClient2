import { Component, Input, OnInit } from '@angular/core';
import { faUserPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { StyleService } from 'src/app/services/api/style.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

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
    private m_oProcessorService: ProcessorService,
    private m_oStyleService: StyleService,
    private m_oWorkflowService: WorkflowService,
    private m_oWorkspaceService: WorkspaceService) { }

  ngOnInit() {
    this.getEnabledUsers();
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

      if (this.resourceType === 'workflow') {
        this.m_oWorkflowService.getUsersBySharedWorkflow(this.resource.workflowId).subscribe({
          next: oResponse => {
            if (oResponse) {
              this.m_aoSharedUsers = oResponse;
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.getUsersBySharedProcessor(this.resource.processorId).subscribe(oResponse => {
          console.log(oResponse)
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            this.m_aoSharedUsers = oResponse;
          }
        })
      }
    }
  }

  onAddEnabledUser() {
    if (this.resourceType && this.resource && this.m_sUserIdSearch.length !== 0) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.putShareWorkspace(this.resource.workspaceId, this.m_sUserIdSearch).subscribe(oResponse => {
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.addStyleSharing(this.resource.styleId, this.m_sUserIdSearch).subscribe(oResponse => {
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

      if (this.resourceType === 'workflow') {
        this.m_oWorkflowService.addWorkflowSharing(this.resource.workflowId, this.m_sUserIdSearch).subscribe({
          next: oResponse => {
            if (oResponse.boolValue === true) {
              this.getEnabledUsers();
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.putShareProcessor(this.resource.processorId, this.m_sUserIdSearch).subscribe(oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            if (oResponse.boolValue) {
              console.log("Sharing Saved");
              this.getEnabledUsers();
            }
          }
        })
      }
    }
  }

  onRemoveEnabledUser(sUserId: string) {

    //Remove whitespace from email 
    FadeoutUtils.utilsRemoveSpaces(sUserId);
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

      if (this.resourceType === 'workflow') {
        this.m_oWorkflowService.removeWorkflowSharing(this.resource.workflowId, sUserId).subscribe({
          next: oResponse => { 
            if(oResponse.stringValue === 'Unauthorized') {
              console.log("You do not have the permissions to remove this user"); 
            } else {
              this.getEnabledUsers();
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.deleteUserSharedProcessor(this.resource.processorId, sUserId).subscribe({
            next: (oResponse) => {
              this.getEnabledUsers(); 
            },
            error: (oError) => {
              console.log("ERROR IN REMOVING USER")

            }
          }
        )
      }
    }
  }
}
