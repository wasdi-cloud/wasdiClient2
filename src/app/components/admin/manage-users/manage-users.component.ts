import { Component, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  m_sUserSearch: string = "";

  m_bLoadingUsers: boolean = true;

  m_aoUsers: any = [];

  m_oSelectedUser: any = {};

  m_bUserIdIsValid: boolean = true;
  m_bUserNameIsValid: boolean = true;
  m_bUserLastNameIsValid: boolean = true;

  // Pagination variables:
  m_iCurrentPage: number = 1;

  m_iTotalUsers: number = 0;

  //Which 
  m_iOffset: number = 0;

  m_iLimit: number = 15;

  m_bStepPageDisabled: boolean = false;
  m_bMinusPageDisabled: boolean = true;

  constructor(private m_oAdminDashboardService: AdminDashboardService,
    private m_oNotificationDisplayService: NotificationDisplayService) {

  }

  ngOnInit(): void {
    // this.executeUserSearch();
    this.getUsersSummary();
    this.getPaginatedList();
    // this.getResourceTypes();

  }

  getPaginatedList() {
    this.m_oAdminDashboardService.getUsersPaginatedList("", this.m_iOffset, this.m_iLimit, null, null).subscribe({
      next: oResponse => {
        console.log(oResponse)
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoUsers = oResponse;
        }
      }
    })
  }

  getUsersSummary() {
    this.m_oAdminDashboardService.getUsersSummary().subscribe({
      next: oResponse => {
        this.m_iTotalUsers = oResponse.totalUsers
      },
      error: oError => {
        console.log(oError)
      }
    })
  }

  getResourceTypes() {
    this.m_oAdminDashboardService.getResourceTypes().subscribe(oResponse => {
      console.log(oResponse)
    })
  }

  setUserSearch(oEvent: any) {
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(oEvent.event.target.value)) {
      this.m_sUserSearch = oEvent.event.target.value;
      console.log(this.m_sUserSearch)
    }
  }

  /**
   * 
   */
  executeUserSearch() {
    this.m_oAdminDashboardService.findUsersByPartialName(this.m_sUserSearch).subscribe({
      next: oResponse => {
        this.m_aoUsers = oResponse;
      },
      error: oError => { }
    })

    this.m_oAdminDashboardService.getUserDetails("betty.spurgeon713@gmail.com").subscribe(oResponse => {
      console.log(oResponse)
    })
  }
  addNewUser() { }

  updateUser() { }

  setSelectedUser(oUser) {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oUser)) {
      this.m_oAdminDashboardService.getUserDetails(oUser.userId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog("Could not load user information")
          } else {
            this.m_oSelectedUser = oResponse
          }
        },
        error: oError => { }
      })
    }
  }

  stepOnePage() {
    this.m_iOffset += this.m_iLimit;
    if (this.m_iOffset >= this.m_iTotalUsers) {
      this.m_bStepPageDisabled = true;
    } else {
      this.getPaginatedList();
      this.m_bMinusPageDisabled = false;
    }
  }

  minusOnePage() {
    this.m_iOffset -= this.m_iLimit;
    this.getPaginatedList();
    if (this.m_iOffset <= 0) {
      this.m_bMinusPageDisabled = true;
    }
  }
}
