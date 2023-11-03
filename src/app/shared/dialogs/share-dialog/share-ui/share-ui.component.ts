import { Component, Input, OnInit } from '@angular/core';

//Import Services: 
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { StyleService } from 'src/app/services/api/style.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { WorkflowService } from 'src/app/services/api/workflow.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

import { faUserPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';

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
  m_sPermission: string = "read";

  @Input() resource: any;
  @Input() resourceType: string;

  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oStyleService: StyleService,
    private m_oTranslate: TranslateService,
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
        this.m_oProcessorParametersTemplateService.getEnabledUsers(this.resource.templateId).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
              this.m_aoSharedUsers = oResponse;
            }
          },
          error: oError => {
            console.log(oError);
          }
        });
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

      if (this.resourceType === "organization") {
        this.m_oOrganizationsService.getUsersBySharedOrganization(this.resource.organizationId).subscribe({
          next: oResponse => {
            this.m_aoSharedUsers = oResponse;
          },
          error: oError => { }
        })
      }

      if (this.resourceType === "subscription") {
        this.m_oSubscriptionService.getUsersBySharedSubscription(this.resource.subscriptionId).subscribe({
          next: oResponse => {
            this.m_aoSharedUsers = oResponse;
          },
          error: oError => { }
        })
      }
    }
  }

  onAddEnabledUser() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sUserIdSearch)) {
      this.m_oAlertDialog.openDialog(4000, "Please enter a valid user");
    }
    if (this.resourceType && this.resource && this.m_sUserIdSearch.length !== 0) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.putShareWorkspace(this.resource.workspaceId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.stringValue === "Done") {
              this.getEnabledUsers();
            }
            if (oResponse.boolValue === false) {
              let sErrorMsg = this.m_oTranslate.instant(oResponse.stringValue);
              this.m_oAlertDialog.openDialog(4000, sErrorMsg);
            }
          },
          error: oError => {
            let sErrorMsg = "Error in Sharing Workspace";
            this.m_oAlertDialog.openDialog(4000, sErrorMsg);
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.addStyleSharing(this.resource.styleId, this.m_sUserIdSearch, this.m_sPermission).subscribe(oResponse => {
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        // this.m_oAdminDashboardService.addResourcePermission(this.resourceType, this.resource.templateId, this.m_sUserIdSearch, this.m_sPermission).subscribe(oResponse => {
        //   this.getEnabledUsers();
        // })
        this.m_oProcessorParametersTemplateService.shareProcessorParameterTemplate(this.resource.templateId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            console.log(oResponse)
          },
          error: oError => {
            console.log(oError);
          }
        })
      }

      if (this.resourceType === 'workflow') {
        this.m_oWorkflowService.addWorkflowSharing(this.resource.workflowId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.boolValue === true) {
              this.getEnabledUsers();
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.putShareProcessor(this.resource.processorId, this.m_sUserIdSearch, this.m_sPermission).subscribe(oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            if (oResponse.boolValue) {
              console.log("Sharing Saved");
              this.getEnabledUsers();
            }
          }
        })
      }

      if (this.resourceType === 'organization') {
        this.m_oOrganizationsService.addOrganizationSharing(this.resource.organizationId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
              if (oResponse.message === "Done") {
                console.log("Sharing Saved");
                this.getEnabledUsers();
              }
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'subscription') {
        this.m_oSubscriptionService.addSubscriptionSharing(this.resource.subscriptionId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.message === "Done") {
              console.log("Sharing Saved");
              this.getEnabledUsers();
            }
          },
          error: oError => { }
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
            if (oResponse.stringValue === 'Unauthorized') {
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

    if (this.resourceType === 'organization') {
      this.m_oOrganizationsService.removeOrganizationSharing(this.resource.organizationId, sUserId).subscribe({
        next: oResponse => {
          console.log("Removal Successful");
          this.getEnabledUsers();
        },
        error: oError => {
          console.log("Error in Removing User");
        }
      })
    }

    if (this.resourceType === 'subscription') {
      this.m_oSubscriptionService.removeSubscriptionSharing(this.resource.subscriptionId, sUserId).subscribe({
        next: oResponse => {
          console.log("Removal Successful");
          this.getEnabledUsers();
        },
        error: oError => { }
      })
    }
  }
}
