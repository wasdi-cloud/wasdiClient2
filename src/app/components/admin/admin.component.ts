import { Component, OnInit } from '@angular/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  host: { 'class': 'flex-fill' }
})
export class AdminComponent implements OnInit {
  m_sActiveTab: string = 'account';

  m_aoOrganizations

  constructor(private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,) { }

  ngOnInit(): void {
    this.getOrganizationsListByUser();
  }

  getActiveTab(sEvent: string) {
    this.m_sActiveTab = sEvent;
  }

  getOrganizationsListByUser() {
    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        if (oResponse.status !== 200) {
          this.m_oNotificationDisplayService.openAlertDialog("ERROR IN FETCHING ORGANIZATIONS");
        } else {
          const oFirstElement = { name: "No Organization", organizationId: null };
          this.m_aoOrganizations = [oFirstElement].concat(oResponse.body);
          console.log(this.m_aoOrganizations)
          // this.m_aoOrganizationsMap = this.m_asOrganizations.map(
          //   (item) => ({ name: item.name, organizationId: item.organizationId })
          // );

          // this.m_aoOrganizationsMap.forEach((oValue, sKey) => {
          //   if (oValue.organizationId == this.m_oEditSubscription.organizationId) {
          //     this.m_oOrganization = oValue;
          //   }
          // });
        }
        // this.m_bLoadingOrganizations = false;
      },
      error: oError => { }
    })
  }
}
