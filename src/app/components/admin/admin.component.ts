import { Component, OnInit } from '@angular/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  host: { 'class': 'flex-fill' }
})
export class AdminComponent implements OnInit {
  m_sActiveTab: string = 'account';

  m_aoOrganizations;

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oTranslate: TranslateService) { }

  ngOnInit(): void {
    this.getOrganizationsListByUser();
  }

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }

  getOrganizationsListByUser() {
    let sMessage = ""
    this.m_oTranslate.get("USER_ORGANIZATIONS_ERROR_FETCHING").subscribe(sResponse => {
      sMessage = sResponse;
    });
    let sErrorTitle = ""
    this.m_oTranslate.get("KEY_PHRASES.ERROR").subscribe(sResponse => {
      sErrorTitle = sResponse;
    });

    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        if (oResponse.status !== 200) {
          this.m_oNotificationDisplayService.openAlertDialog(sMessage, sErrorTitle, 'danger');
        } else {
          const oFirstElement = { name: "No Organization", organizationId: null };
          this.m_aoOrganizations = [oFirstElement].concat(oResponse.body);
        }
      },
      error: oError => { }
    })
  }
}
