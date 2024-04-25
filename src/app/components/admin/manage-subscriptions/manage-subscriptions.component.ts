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

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oSubscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    this.getSubscriptions();
    this.getSubscriptionTypes();
  }

  getSubscriptions() {
    this.m_oSubscriptionService.getPaginatedSubscriptions("", "", "", this.m_iOffset, this.m_iLimit).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscriptions")
        } else {
          this.m_aoSubscriptions = oResponse;
          console.log(this.m_aoSubscriptions)
        }
      },
      error: oError => { }
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
    console.log(oSubscription)
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSubscription) === false) {
      this.m_oSubscriptionService.getSubscriptionById(oSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog("Error while getting subscription information");
          } else {
            this.m_oSelectedSubscription = oResponse;
            console.log(oResponse);
          }
        },
        error: oError => { }
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
              this.m_oNotificationDisplayService.openSnackBar("Subscription Removed", "Close");
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
          console.log(this.m_aoTypes)

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
        this.m_oSelectedSubscription.organizationId = oEvent.event.target.value;
        break;
      default:
        break;
    }
  }

  updateSubscription(oSubscription) {
    this.m_oSubscriptionService.updateSubscription(oSubscription).subscribe({
      next: oResponse => { },
      error: oError => { }
    })
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
    if (this.m_iOffset <= 0) {
      this.m_bMinusPageDisabled = true;
    }
  }
}
