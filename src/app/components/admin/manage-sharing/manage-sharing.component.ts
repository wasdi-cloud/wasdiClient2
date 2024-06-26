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
      error: oError => { }
    })
  }

  findResourcePermissions(sResourceType: string, sResourceId: string, sUserId: string) {
    this.m_oAdminDashboard.findResourcePermissions(sResourceType, sResourceId, sUserId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          let sMsg = this.m_oTranslate.instant("ADMIN_SHARING_SHARE_ERROR_GET_RES");
          this.m_oNotificationDisplayService.openAlertDialog(sMsg);
        } else {
          this.m_aoFoundResources = oResponse;
        }
      },
      error: oError => { }
    })
  }

  addResourcePermission(sResourceType: string, sResourceId: string, sUserId: string, sRights: string) {
    this.m_oAdminDashboard.addResourcePermission(sResourceType, sResourceId, sUserId, sRights).subscribe({
      next: oResponse => {
        let sMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_URL")
        this.m_oNotificationDisplayService.openSnackBar(sMsg, '', 'success-snackbar');

      },
      error: oError => { }
    })
  }

  removeResourcePermission(sResourceType: string, sResourceId: string, sUserId: string) {
    this.m_oAdminDashboard.removeResourcePermission(sResourceType, sResourceId, sUserId).subscribe({
      next: oResponse => {
        this.m_oAdminDashboard.findResourcePermissions(sResourceType, sResourceId, sUserId);
      },
      error: oError => { }
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
