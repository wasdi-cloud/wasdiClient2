import { Component, Input, OnInit } from '@angular/core';

//Import Services: 
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { StyleService } from 'src/app/services/api/style.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { WorkflowService } from 'src/app/services/api/workflow.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


@Component({
  selector: 'app-share-ui',
  templateUrl: './share-ui.component.html',
  styleUrls: ['./share-ui.component.css']
})
export class ShareUiComponent implements OnInit {
  m_aoShareOptions = [
    'read', 'write'
  ]

  m_aoSharedUsers: any;
  m_sUserIdSearch: string;
  m_sPermission: string = "read";

  m_bIsReadOnly: boolean = true;

  m_bShowUsers: boolean = true;

  m_bShowInput: boolean = false;

  m_bLoadingUsers: boolean = true;

  @Input() resource: any;
  @Input() resourceType: string;

  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
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

    this.m_bIsReadOnly = this.resource.readOnly;
    console.log(this.resource)

  }

  getEnabledUsers() {
    this.m_sUserIdSearch = "";
    this.m_sPermission = "";
    if (this.resourceType && this.resource) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.getUsersBySharedWorkspace(this.resource.workspaceId).subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
            this.m_bLoadingUsers = false;
            this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.getUsersBySharedStyle(this.resource.styleId).subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
            this.m_bLoadingUsers = false;
            this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
          }
        })
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        this.m_oProcessorParametersTemplateService.getEnabledUsers(this.resource.templateId).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
              this.m_aoSharedUsers = oResponse;
              this.m_bLoadingUsers = false;
              this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
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
              this.m_bLoadingUsers = false;
              this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
            }
          },
          error: oError => { }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.getUsersBySharedProcessor(this.resource.processorId).subscribe(oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            this.m_aoSharedUsers = oResponse;
            this.m_bLoadingUsers = false;
            this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
          }
        })
      }

      if (this.resourceType === "organization") {
        this.m_oOrganizationsService.getUsersBySharedOrganization(this.resource.organizationId).subscribe({
          next: oResponse => {
            this.m_aoSharedUsers = oResponse;
            this.m_bLoadingUsers = false;
            this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
          },
          error: oError => { }
        })
      }

      if (this.resourceType === "subscription") {
        this.m_oSubscriptionService.getUsersBySharedSubscription(this.resource.subscriptionId).subscribe({
          next: oResponse => {
            this.m_aoSharedUsers = oResponse;
            this.m_bLoadingUsers = false;
            this.m_aoSharedUsers.length > 0 ? this.m_bShowUsers = true : this.m_bShowUsers = false;
          },
          error: oError => { }
        })
      }
    }
  }

  onAddEnabledUser() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sUserIdSearch)) {
      this.m_oNotificationDisplayService.openAlertDialog("Please enter a valid user");
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
              this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
            }
          },
          error: oError => {
            let sErrorMsg = "Error in Sharing Workspace";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }

      if (this.resourceType === 'style') {
        this.m_oStyleService.addStyleSharing(this.resource.styleId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.stringValue === "Done") {
              this.getEnabledUsers();
              let sMessage = `Successfully Shared ${this.resource.name ? this.resource.name : this.resource.processorName}`
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              this.m_oNotificationDisplayService.openAlertDialog(oResponse.stringValue);
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this style";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        });
      }

      if (this.resourceType === 'PROCESSORPARAMETERSTEMPLATE') {
        this.m_oProcessorParametersTemplateService.shareProcessorParameterTemplate(this.resource.templateId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.stringValue === "Done") {
              this.getEnabledUsers();
              let sMessage = `Successfully Shared ${this.resource.name}`
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              let sErrorMsg = this.m_oTranslate.instant(oResponse.stringValue)
              this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this Processor Parameters Template";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }

      if (this.resourceType === 'workflow') {
        this.m_oWorkflowService.addWorkflowSharing(this.resource.workflowId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.stringValue === "Done") {
              this.getEnabledUsers();
              let sMessage = `Successfully shared ${this.resource.name}`
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              this.m_oNotificationDisplayService.openAlertDialog(oResponse.stringValue);
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this workflow";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }

      if (this.resourceType === 'processor') {
        this.m_oProcessorService.putShareProcessor(this.resource.processorId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.boolValue === true) {
              this.getEnabledUsers();
              let sMessage = `Successfully shared ${this.resource.name}`;
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              this.m_oNotificationDisplayService.openAlertDialog(oResponse.stringValue)
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this workflow";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        });
      }

      if (this.resourceType === 'organization') {
        this.m_oOrganizationsService.addOrganizationSharing(this.resource.organizationId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (oResponse.message === "Done") {
              this.getEnabledUsers();
              let sMessage = `Successfully shared ${this.resource.name}`;
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              this.m_oNotificationDisplayService.openAlertDialog(oResponse.stringValue)
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this workflow";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }

      if (this.resourceType === 'subscription') {
        this.m_oSubscriptionService.addSubscriptionSharing(this.resource.subscriptionId, this.m_sUserIdSearch, this.m_sPermission).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.message === "Done") {
              let sMessage = `Successfully shared ${this.resource.name}`;
              this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            } else {
              this.m_oNotificationDisplayService.openAlertDialog(oResponse.stringValue)
            }
          },
          error: oError => {
            let sErrorMsg = "Error in sharing this workflow";
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
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
            if (oResponse.stringValue === 'Unauthorized') {
              this.m_oNotificationDisplayService.openAlertDialog("You do not have the permissions to remove this user");
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
        });
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
      });
    }

    if (this.resourceType === 'subscription') {
      this.m_oSubscriptionService.removeSubscriptionSharing(this.resource.subscriptionId, sUserId).subscribe({
        next: oResponse => {
          console.log("Removal Successful");
          this.getEnabledUsers();
        },
        error: oError => { }
      });
    }
  }

  toggleShowInput() {
    this.m_bShowInput = !this.m_bShowInput
  }

  getEmailInput(oEvent: any) {
    this.m_sUserIdSearch = oEvent.event.target.value;
  }

  getPermissionInput(oEvent) {
    this.m_sPermission = oEvent.value;
  }

  openSharedUsers() {
    this.m_bShowUsers = true;
    this.m_bShowInput = true;
  }
}
