import { Component, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { NodeService } from 'src/app/services/api/node.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

const asRoles = [
  "ADMIN",
  "DEVELOPER",
  "USER"
]
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

  m_iOffset: number = 0;

  m_iLimit: number = 10;

  m_bStepPageDisabled: boolean = false;
  m_bMinusPageDisabled: boolean = true;

  m_aoNodes: Array<any> = [];

  m_asRoles: Array<string> = asRoles

  m_iUserProcessingTime: number = 0;

  m_sStartDate = new Date();

  m_sDateTo = new Date().toISOString().slice(0, 10);

  m_sDateFrom = new Date(
    this.m_sStartDate.getFullYear(),
    this.m_sStartDate.getMonth(),
    this.m_sStartDate.getDate() - 7
  ).toISOString().slice(0, 10);

  m_oUserTotals = null;

  m_asUserTypes = ["freeUsers", "noneUsers", "organizations", "proUsers", "standardUsers", "totalUsers"]

  m_iShownNumber: number = null;

  m_sTotalUsers: string = "totalUsers ";

  m_sSortOrder: string = ''

  m_sSortBy: string = '';

  constructor(private m_oAdminDashboardService: AdminDashboardService,
    private m_oNodeService: NodeService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService) {

  }

  ngOnInit(): void {
    this.getUsersSummary();
    this.getPaginatedList();
    this.getNodesList();
  }

  getPaginatedList(oEvent?: any) {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent)) {
      this.m_sUserSearch = "";
    }
    this.m_oAdminDashboardService.getUsersPaginatedList("", this.m_iOffset, this.m_iLimit, this.m_sSortBy, this.m_sSortOrder).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoUsers = oResponse;
        }
      }
    })
  }

  getUsersSummary() {
    this.m_oAdminDashboardService.getUsersSummary().subscribe({
      next: oResponse => {
        this.m_iTotalUsers = oResponse.totalUsers;
        this.m_oUserTotals = oResponse;

        this.m_iShownNumber = oResponse.totalUsers;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not load user information");
      }
    })
  }

  setUserSearch(oEvent: any) {
    if (!FadeoutUtils.utilsIsStrNullOrEmpty(oEvent.event.target.value)) {
      this.m_sUserSearch = oEvent.event.target.value;
    }
  }

  executeUserSearch() {
    this.m_oAdminDashboardService.findUsersByPartialName(this.m_sUserSearch).subscribe({
      next: oResponse => {
        this.m_aoUsers = oResponse;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog('Could not find a user matching this query.')
      }
    })
  }

  updateUser(oUser) {
    this.m_oAdminDashboardService.updateUser(oUser).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("User Updated. Refreshing.");
        if (this.m_sUserSearch) {
          this.executeUserSearch();
        } else {
          this.getPaginatedList();
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(`There was an error while trying to update ${oUser.userId}`)
      }
    })
  }

  deleteUser(oUser: any) {
    this.m_oNotificationDisplayService.openConfirmationDialog(`Are you sure you wish to DELETE ${oUser.userId}? <br> This is a destructive action and cannot be undone`).subscribe(oResponse => {
      if (oResponse === true) {
        this.m_oAdminDashboardService.deleteUser(oUser.userId).subscribe({
          next: oResponse => {
            this.getUsersSummary();
            this.getPaginatedList();
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(`An error occured while trying to delete ${oUser.userId}`)
          }
        })
      }
    })
  }

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
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Could not load user information", "", "alert")
        }
      })
    }
  }

  getNodesList() {
    this.m_oNodeService.getNodesList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error while retrieving the nodes list");
        } else {
          this.m_aoNodes = oResponse.map(oNode => {
            return oNode.nodeCode
          });


        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not get the Nodes list.")
      }
    })
  }

  /********** Pagination Handlers **********/
  handlePagination(oEvent) {
    // previousPageIndex: 1, pageIndex: 2, pageSize: 10, length: 0
    if (oEvent.previousPageIndex > oEvent.pageIndex) {
      this.minusOnePage()
    } else {
      this.stepOnePage()
    }
  }
  stepOnePage() {
    this.m_iOffset += this.m_iLimit;
    this.getPaginatedList();
  }

  minusOnePage() {
    this.m_iOffset -= this.m_iLimit;
    this.getPaginatedList();
  }

  handleItemsPerPageChange(oEvent) {
    this.m_iLimit = oEvent;
    this.getPaginatedList();
  }
  setInputSelections(oEvent: any, sLabel: string) {
    switch (sLabel) {
      case 'isActive':
        this.m_oSelectedUser.active = oEvent.target.checked;
        break;
      case 'userId':
        this.m_oSelectedUser.userId = oEvent.event.target.value;
        break;
      case 'name':
        this.m_oSelectedUser.name = oEvent.event.target.value;
        break;
      case 'surname':
        this.m_oSelectedUser.surname = oEvent.event.target.value;
        break;
      case 'node':
        this.m_oSelectedUser.defaultNode = oEvent.event.target.value;
        break;
      case 'role':
        this.m_oSelectedUser.role = oEvent.value;
        break
      default:
        break;
    }
  }

  // showUserSubscriptions(oUser) {
  //   this.m_oAdminDashboardService.getResourceTypes().subscribe(oResponse => {
  //     console.log(oResponse);
  //   })
  //   this.m_oAdminDashboardService.findResourcePermissions("STYLE", null, oUser.userId).subscribe({
  //     next: oResponse => {
  //       console.log(oResponse);
  //     },
  //     error: oError => {
  //       console.log(oError)
  //     }
  //   })
  // }

  setDateInput(oEvent, sLabel) {
    if (sLabel === 'to') {
      this.m_sDateTo = oEvent.event.target.value
    } else {
      this.m_sDateFrom = oEvent.event.target.value
    }
  }

  computeRunningTime() {
    let sDateFromParse = new Date(
      Date.parse(this.m_sDateFrom + ":00:00")
    ).toISOString();
    let sDateToParse = new Date(
      Date.parse(this.m_sDateTo + ":00:00")
    ).toISOString();
    // this.m_sDateFrom = new Date(this.m_sDateFrom)
    this.m_oProcessWorkspaceService.getProcessWorkspaceTotalRunningTimeByUserAndInterval(this.m_oSelectedUser.userId, sDateFromParse, sDateToParse).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error in computing running time")
        } else {
          this.m_iUserProcessingTime = oResponse;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not compute running time", "", "alert")
      }
    })
  }

  setUsersNumber(oEvent) {
    this.m_iShownNumber = this.m_oUserTotals[oEvent.value]

    this.m_sTotalUsers = oEvent.value
  }

  getSortedUsers(sSortBy: string) {
    this.m_sSortBy = sSortBy
    if (this.m_sSortBy !== sSortBy) {
      this.m_sSortOrder = 'asc'
    } else {
      this.m_sSortOrder === 'asc' ? this.m_sSortOrder = 'desc' : this.m_sSortOrder = 'asc';
    }
    this.getPaginatedList()
  }
}
