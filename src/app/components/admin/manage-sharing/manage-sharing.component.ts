import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private m_oAdminDashboard: AdminDashboardService,
    private m_oClipboard: Clipboard,
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
}
