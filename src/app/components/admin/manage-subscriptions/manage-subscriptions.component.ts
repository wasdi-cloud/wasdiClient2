import { Component, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

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

  m_sSearch: string = "";

  //Date Properties:
  m_sBuyDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number | string;

  m_oOrganization: any = "";

  m_sSubscriptionSortBy: string = "User Id";

  m_sUserIdSearch = "";
  m_sSubscriptionIdSearch = "";
  m_sSubscriptionNameSearch = "";

  m_asSortOptions: Array<string> = ["User Id", "Subscription Id", "Subscription Name"]

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oSubscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.getSubscriptions();
    this.getSubscriptionTypes();

    if (!this.m_oSelectedSubscription.subscriptionId) {
      this.initDates();
    }
  }

  getSubscriptions() {
    this.m_oSubscriptionService.getPaginatedSubscriptions("", "", this.m_sSearch, this.m_iOffset, this.m_iLimit).subscribe({
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
    console.log(this.m_oSelectedSubscription)
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
}
