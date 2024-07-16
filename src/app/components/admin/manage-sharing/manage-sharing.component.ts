import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-sharing',
  templateUrl: './manage-sharing.component.html',
  styleUrls: ['./manage-sharing.component.css']
})
export class ManageSharingComponent implements OnInit {
  m_aoResourceTypes: Array<any> = [];

  m_aoFoundResources: Array<any> = [];

  m_aoShareOptions = [
    'read', 'write'
  ]

  m_sSelectedType: string = "";
  m_sResourceId: string = "";
  m_sUserId: string = "";
  m_sRights: string = "";

  m_bSearchedByResourceName: boolean = false;

  m_sResourceName: string = "";

  m_iLimit: number = 10;

  m_iOffset: number = 10;

  constructor(
    private m_oAdminDashboard: AdminDashboardService,
    private m_oClipboard: Clipboard,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getResourceTypes();
  }

  getResourceTypes() {
    this.m_oAdminDashboard.getResourceTypes().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          let sMsg = this.m_oTranslate.instant("ADMIN_SHARING_SHARE_ERROR_GET_TYPES");
          this.m_oNotificationDisplayService.openAlertDialog(sMsg);
        } else {
          this.m_aoResourceTypes = oResponse;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not get resource types", "", "alert")
      }
    })
  }

  findResourcePermissions(sResourceType: string, sResourceId: string, sUserId: string) {
    this.m_aoFoundResources = [];
    if (sUserId) {
      this.m_oAdminDashboard.findUsersByPartialName(sUserId).subscribe({
        next: oResponse => {
          oResponse.forEach(element => {
            let oUserInfo = {
              name: element.userId,
              foundResources: []
            }
            this.m_oAdminDashboard.findResourcePermissions(sResourceType, sResourceId, element.userId).subscribe({
              next: oResponse => {
                if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
                  let sMsg = this.m_oTranslate.instant("ADMIN_SHARING_SHARE_ERROR_GET_RES");
                  this.m_oNotificationDisplayService.openAlertDialog(sMsg);
                } else {
                  oUserInfo.foundResources = oResponse;
                  this.m_aoFoundResources.push(oUserInfo)
                  this.m_bSearchedByResourceName = false;
                }
              },
              error: oError => {
                this.m_oNotificationDisplayService.openAlertDialog("Could not retrieve resources", "", "alert")
              }
            })
          });
        }
      })
    } else {
      this.m_oAdminDashboard.findResourcePermissions(sResourceType, sResourceId, sUserId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            let sMsg = this.m_oTranslate.instant("ADMIN_SHARING_SHARE_ERROR_GET_RES");
            this.m_oNotificationDisplayService.openAlertDialog(sMsg);
          } else {
            this.m_aoFoundResources = oResponse
            this.m_bSearchedByResourceName = false;
          }
          if (!oResponse.length) {
            this.m_oNotificationDisplayService.openAlertDialog("No resources found", "", "alert")
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Could not retrieve resources", "", "alert")
        }
      })

    }
  }

  addResourcePermission(sResourceType: string, sResourceId: string, sUserId: string, sRights: string) {
    sResourceId = sResourceId.trim();
    this.m_oAdminDashboard.addResourcePermission(sResourceType, sResourceId, sUserId, sRights).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Resource permission added", '', 'success-snackbar');
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not add resource permission", '', 'alert')
      }
    })
  }

  removeResourcePermission(sResourceType: string, sResourceId: string, sUserId: string) {
    this.m_oAdminDashboard.removeResourcePermission(sResourceType, sResourceId, sUserId).subscribe({
      next: oResponse => {
        this.m_oAdminDashboard.findResourcePermissions(sResourceType, sResourceId, sUserId);
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not remove resource permission", '', 'alert')
      }
    })
  }

  setResourceType(oEvent) {
    this.m_sSelectedType = oEvent.value;
  }

  setResourceId(oEvent) {
    this.m_sResourceId = oEvent.event.target.value;
  }

  setUserId(oEvent) {
    this.m_sUserId = oEvent.event.target.value;
  }

  setPermissionRights(oEvent) {
    this.m_sRights = oEvent.value;
  }

  copyToClipboard(sResourceId: string) {
    this.m_oClipboard.copy(sResourceId);
    let sMsg = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD")
    this.m_oNotificationDisplayService.openSnackBar(sMsg);
  }

  findResourceByPartialName() {
    this.m_oAdminDashboard.findResourceByPartialName(this.m_sResourceName, this.m_sSelectedType.toLowerCase(), this.m_iOffset, this.m_iLimit).subscribe({
      next: oResponse => {
        if (oResponse.length === 0) {
          this.m_oNotificationDisplayService.openAlertDialog("Did not find any resources with these parameters", "", "alert")
        } else {
          this.m_bSearchedByResourceName = true;
          this.m_aoFoundResources = oResponse;
          this.m_iOffset = 10;
        }
      },
      error: oError => {
        if (oError.message) {
          this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("MSG_ERROR_INVALID_PARTIAL_NAME"), '', "alert")
        } else {
          this.m_oNotificationDisplayService.openAlertDialog("Could not find resources with these parameters", '', "alert")
        }
        this.m_aoFoundResources = []
      }
    });
  }

  openCollaborators(sResourceType, oResource) {
    let dialogData = new ShareDialogModel(sResourceType.toLowerCase(), oResource);
    this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      height: '60vh',
      data: dialogData
    })
  }

  handlePagination(oEvent, sTable) {
    console.log(oEvent)
    if (oEvent.previousPageIndex < oEvent.pageIndex) {
      this.m_iOffset += this.m_iLimit
    } else {
      this.m_iOffset -= this.m_iLimit
    }
    if (sTable === 'resource-by-name') {
      this.findResourceByPartialName()
    }
  }
}

// resourceId
// :
// "02ae1152-4468-4a4b-b1d1-eed7c35a6192"
// resourceName
// :
// "test_2"
// resourceType
// :
// "PROCESSOR"
// userId
// :
// "betty.spurgeon@wasdi.cloud"