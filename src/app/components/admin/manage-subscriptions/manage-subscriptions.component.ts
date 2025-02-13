import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-manage-subscriptions',
  templateUrl: './manage-subscriptions.component.html',
  styleUrls: ['./manage-subscriptions.component.css']
})
export class ManageSubscriptionsComponent implements OnInit {
  m_aoSubscriptions: Array<any> = [];
  m_aoTypes: Array<any> = [];
  m_asTypesMap: Array<string> = [];
  m_bLoadingSubscriptions: boolean = true;
  m_oSelectedSubscription: any = {};
  m_oSelectedSubscriptionType: any = {};

  m_iCurrentPage: number = 1;
  m_iTotalSubscriptions: number = 0;

  m_iOffset: number = 0;

  m_iLimit: number = 10;

  m_bStepPageDisabled: boolean = false;
  m_bMinusPageDisabled: boolean = true;

  m_sNameSearch: string = "";
  m_sUserSearch: string = "";
  m_sUserNameSearch: string = "";
  m_sIdSearch: string = "";
  m_sSearch: string = "";

  //Date Properties:
  m_sBuyDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number | string;

  m_oOrganization: any = "";

  m_sSubscriptionSortBy: string = "Subscription Name";


  m_sSortBy: string = ""
  m_sSortOrder: string = ""

  m_bMultiTables = false;

  m_aoFoundUsers = [];

  m_asSortOptions: Array<string> = ["User Id", "Subscription Id", "Subscription Name", "User First Name", "User Last Name"]

  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oClipboard: Clipboard,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService,
    private m_oSubscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.getSubscriptionsCount();
    this.getSubscriptions();
    this.getSubscriptionTypes();

    if (!this.m_oSelectedSubscription.subscriptionId) {
      this.initDates();
    }
  }

  getSubscriptionsCount() {
    this.m_oSubscriptionService.getSubscriptionCount().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscriptions")
        } else {
          this.m_iTotalSubscriptions = oResponse.intValue;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not get subscriptions")
      }
    })
  }

  getSubscriptions() {
    this.m_oSubscriptionService.getPaginatedSubscriptions(this.m_sUserSearch, this.m_sIdSearch, this.m_sNameSearch, this.m_iOffset, this.m_iLimit, this.m_sSortBy, this.m_sSortOrder).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscriptions")
        } else {
          this.m_aoSubscriptions = oResponse;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Could not get subscriptions")
      }
    })
  }

  subscriptionActive(oSubscription) {
    let iDaysRemaining = 'Expired';
    let sCurrentDate = Date.now();
    let sEndTimestamp = Date.parse(oSubscription.endDate);

    let iRemaningDays = Math.ceil((sEndTimestamp - sCurrentDate) / (1000 * 3600 * 24));

    if (iRemaningDays <= 0) {
      iDaysRemaining = "Expired"
    } else {
      iDaysRemaining = `${iRemaningDays}`;
    }

    return iDaysRemaining.toString();
  }

  setSelectedSubscription(oSubscription: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSubscription) === false) {
      this.m_oSubscriptionService.getSubscriptionById(oSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscription information", '', 'danger');
          } else {
            this.m_oSelectedSubscription = oResponse;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscription information", '', 'danger');
        }
      })
    } else {
      this.m_oSelectedSubscription = {};
    }

  }

  deleteSubscription(oSubscription: any) {
    this.m_oNotificationDisplayService.openConfirmationDialog(`Are you sure you want to delete ${oSubscription.name}? <br> This is a destructive action and cannot be undone`).subscribe(bResult => {
      if (bResult === true) {
        this.m_oSubscriptionService.deleteSubscription(oSubscription.subscriptionId).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
              this.m_oNotificationDisplayService.openAlertDialog("Error while deleting subscription")
            } else {
              this.m_oNotificationDisplayService.openSnackBar("Subscription Removed");
              this.getSubscriptions();
            }
          }
        })
      }
    })
  }

  getSubscriptionTypes() {
    this.m_oSubscriptionService.getSubscriptionTypes().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error getting Subscription Types");
        } else {
          this.m_aoTypes = oResponse.body;
          this.m_asTypesMap = this.m_aoTypes.map(oType => {
            return oType.name;
          })
        }
      }
    })
  }

  setInputSelections(oEvent, sLabel: string) {
    switch (sLabel) {
      case 'name':
        this.m_oSelectedSubscription.name = oEvent.event.target.value;
        break;
      case 'userId':
        this.m_oSelectedSubscription.userId = oEvent.event.target.value;
        break;
      case 'orgId':
        this.m_oOrganization = oEvent.event.target.value;
        break;
      case 'startDate':
        this.m_sStartDate = oEvent.event.target.value;
        break;
      case 'endDate':
        this.m_sEndDate = oEvent.event.target.value;
        break;
      default:
        break;
    }
  }

  updateSubscription(oSubscription) {
    this.m_oSubscriptionService.updateSubscription(oSubscription).subscribe({
      next: oResponse => {
        if (oResponse) {
          this.m_oNotificationDisplayService.openSnackBar("Updated Subscription", '', 'success-snackbar');
          this.getSubscriptions();
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error while updating subscription", '', 'alert');
      }
    })
  }

  createSubscriptionObject() {
    if (!this.m_oSelectedSubscription.name) {
      this.m_oSelectedSubscription.name = this.m_oSelectedSubscription.typeName;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganization)) {
      this.m_oSelectedSubscription.organizationId = "";
    } else {
      this.m_oSelectedSubscription.organizationId = this.m_oOrganization.organizationId;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.startDate)) {
      this.m_oSelectedSubscription.startDate = new Date(this.m_sStartDate).toISOString();
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.endDate)) {
      this.m_oSelectedSubscription.endDate = new Date(this.m_sEndDate).toISOString();
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.durationDays)) {
      this.m_oSelectedSubscription.durationDays = this.m_iDurationDays;
    }

    //When creating from the Admin Panel - ensure buySuccess = true
    this.m_oSelectedSubscription.buySuccess = true;
  }

  createNewSubscription(oSubscription) {
    this.createSubscriptionObject();
    if (this.checkIsSubscriptionValid() === true) {
      this.m_oSubscriptionService.createSubscription(this.m_oSelectedSubscription).subscribe({
        next: oResponse => {
          this.m_oNotificationDisplayService.openSnackBar("Subscription Created!", '', 'success-snackbar');
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("An error occurred while creating this subscription")
        }
      })
    } else {
      this.m_oNotificationDisplayService.openAlertDialog("Subscription is not valid", "", "alert")
    }
  }

  checkIsSubscriptionValid() {
    let bReturnValue = true;
    if (!this.m_oSelectedSubscription.userId) {
      bReturnValue = false;
    }
    if (!this.m_oSelectedSubscription.startDate) {
      bReturnValue = false
    }
    if (!this.m_oSelectedSubscription.endDate) {
      bReturnValue = false
    }
    // The start and end date should not be the same
    if (this.m_oSelectedSubscription.startDate === this.m_oSelectedSubscription.endDate) {
      bReturnValue = false
    }
    return bReturnValue
  }

  getDaysRemaining(sStartDate: any, sEndDate: any) {
    let sCurrentDate = Date.now();
    let sEndTimestamp = Date.parse(sEndDate);

    let iRemaningDays = Math.ceil((sEndTimestamp - sCurrentDate) / (1000 * 3600 * 24));

    if (iRemaningDays <= 0) {
      this.m_iDaysRemaining = "Expired"
    } else {
      this.m_iDaysRemaining = `${iRemaningDays}`;
    }
  }

  /********** Pagination Handlers **********/
  handleItemsPerPageChange(oEvent) {
    this.m_iLimit = oEvent
    this.getSubscriptions();
  }

  handlePagination(oEvent) {
    if (oEvent.previousPageIndex > oEvent.pageIndex) {
      this.minusOnePage();
    } else {
      this.stepOnePage();
    }
  }

  stepOnePage() {
    this.m_iOffset += this.m_iLimit;
    this.m_bStepPageDisabled = false
    this.getSubscriptions();
    this.m_bMinusPageDisabled = false;
  }

  minusOnePage() {
    this.m_iOffset -= this.m_iLimit;
    this.m_bStepPageDisabled = false;
    this.getSubscriptions();
  }

  setSubscriptionSearch(oEvent) {
    this.m_sSearch = oEvent.event.target.value;
  }

  getTypeSelection(oEvent) {
    let sSelectedType = oEvent.value;
    this.m_aoTypes.forEach(oType => {
      if (oType.name === sSelectedType) {
        this.m_oSelectedSubscription.typeId = oType.typeId;
        this.m_oSelectedSubscription.typeName = oType.name;
      }
    })
    this.initDates()
  }

  initDates() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.buyDate)) {
      this.m_sBuyDate = null;
    } else {
      this.m_sBuyDate = new Date(this.m_oSelectedSubscription.buyDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.startDate)) {
      this.m_sStartDate = new Date();
    } else {
      this.m_sStartDate = new Date(this.m_oSelectedSubscription.startDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedSubscription.endDate)) {
      this.m_sEndDate = new Date();

      if (this.m_oSelectedSubscription.typeId) {
        if (this.m_oSelectedSubscription.typeId.toLowerCase().includes("day")) {
          this.m_sEndDate.setDate(this.m_sStartDate.getDate() + 1);
        } else if (this.m_oSelectedSubscription.typeId.toLowerCase().includes("week")) {
          this.m_sEndDate.setDate(this.m_sStartDate.getDate() + 7);
        } else if (this.m_oSelectedSubscription.typeId.toLowerCase().includes("month")) {
          this.m_sEndDate.setMonth(this.m_sStartDate.getMonth() + 1);
        } else if (this.m_oSelectedSubscription.typeId.toLowerCase().includes("year")) {
          this.m_sEndDate.setFullYear(this.m_sStartDate.getFullYear() + 1);
        }
      }
    } else {
      this.m_sEndDate = new Date(this.m_oSelectedSubscription.endDate);
    }

    let lDifferenceInTime = this.m_sEndDate.getTime() - this.m_sStartDate.getTime();
    this.m_iDurationDays = lDifferenceInTime / (1000 * 3600 * 24);
    this.m_iDurationDays = Math.round(this.m_iDurationDays);
  }

  setSortType(oEvent) {
    this.m_sSubscriptionSortBy = oEvent.value;
  }

  clearSearchInputs() {
    this.m_sNameSearch = "";
    this.m_sUserSearch = "";
    this.m_sIdSearch = "";
    this.m_sSearch = "";

    this.m_bMultiTables = false;
    this.getSubscriptions()
  }

  getSortedOrder(sSortBy: string) {
    this.m_sSortBy = sSortBy
    if (this.m_sSortBy !== sSortBy) {
      this.m_sSortOrder = 'asc'
    } else {
      this.m_sSortOrder === 'asc' ? this.m_sSortOrder = 'desc' : this.m_sSortOrder = 'asc';
    }

    this.getSubscriptions()
  }

  executeSearch() {
    switch (this.m_sSubscriptionSortBy) {
      case 'User Id':
        this.m_sUserSearch = this.m_sSearch;
        break;
      case 'Subscription Id':
        this.m_sIdSearch = this.m_sSearch
        break;
      case 'Subscription Name':
        this.m_sNameSearch = this.m_sSearch
        break;
      default:
        this.m_sUserNameSearch = this.m_sSearch;
        break;
    }
    // If searching by partial of user's NAME: 
    if (this.m_sSubscriptionSortBy === 'User First Name' || this.m_sSubscriptionSortBy === 'User Last Name') {
      this.m_bMultiTables = true;
      this.m_oAdminDashboardService.findUsersByPartialName(this.m_sUserNameSearch).subscribe({
        next: oResponse => {
          if (oResponse.length === 0) {
            this.m_oNotificationDisplayService.openAlertDialog("Could not find users with this name")
          } else {
            this.m_aoSubscriptions = oResponse
            this.m_aoSubscriptions.forEach(oUser => {
              this.m_oSubscriptionService.getPaginatedSubscriptions(oUser.userId, "", "", this.m_iOffset, this.m_iLimit, this.m_sSortBy, this.m_sSortOrder).subscribe({
                next: oResponse => {
                  oUser.foundSubscriptions = oResponse
                },
                error: oError => {
                  this.m_bMultiTables = false;
                }
              })
            })
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Could not get users");
        }
      })
    } else {
      this.m_bMultiTables = false;
      this.getSubscriptions()
    }
  }

  copyToClipboard(sSubscriptionId: string) {
    this.m_oClipboard.copy(sSubscriptionId);
    let sMsg = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD")
    this.m_oNotificationDisplayService.openSnackBar(sMsg);
  }
}
