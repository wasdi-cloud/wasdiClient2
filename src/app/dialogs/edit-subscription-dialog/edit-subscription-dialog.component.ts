import { Component, Inject, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { TranslateService } from '@ngx-translate/core';


import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


@Component({
  selector: 'app-edit-subscription-dialog',
  templateUrl: './edit-subscription-dialog.component.html',
  styleUrls: ['./edit-subscription-dialog.component.css']
})
export class EditSubscriptionDialogComponent implements OnInit {
  m_oUser = this.m_oConstantsService.getUser();

  //Organizations Properties:
  m_aoOrganizations: any = [];
  m_aoOrganizationsMap: any = [];
  m_aoUserOrganizations: any = [];
  m_oOrganization: any = {};
  m_bLoadingOrganizations: boolean = true;
  m_oSelectedOrganization: any;

  //Date Properties:
  m_sBuyDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number | string;

  //Susbscription Information passed from opening dialog
  m_oEditSubscription: any;


  //State Booleans:
  m_bCheckoutNow: boolean = false;
  m_bIsPaid: boolean = true;
  m_bEditMode: boolean = true;
  m_bIsOwner: boolean = true;


  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<EditSubscriptionDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService,
    // private m_oWindow: Window
  ) { }

  ngOnInit(): void {
    //Set Subscription Information from Dialog Data:
    this.m_oEditSubscription = this.m_oData.subscription;
    this.m_bEditMode = this.m_oData.editMode;

    this.initSubscriptionInfo();
  }

  /**
   * Initialize the Edit Subscription Information:
   */
  initSubscriptionInfo() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditSubscription.subscriptionId)) {
      this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
      this.initDates();
      this.getOrganizationsListByUser();
    } else {
      this.m_oSubscriptionService.getSubscriptionById(this.m_oEditSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oEditSubscription = oResponse;
            this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
            this.initDates();
            this.getOrganizationsListByUser();
            this.getDaysRemaining(this.m_oEditSubscription.startDate, this.m_oEditSubscription.endDate)
          } else {
            let sErrorTitle = this.m_oTranslate.instant("KEY_PHRASES.ERROR");
            let sErrorMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_ID_ERROR")
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sErrorTitle, 'danger');
          }
        },
        error: oError => { }
      });
    }
  }


  createSubscriptionObject() {
    if (!this.m_oEditSubscription.name) {
      this.m_oEditSubscription.name = this.m_oEditSubscription.typeName;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganization)) {
      this.m_oEditSubscription.organizationId = "";
    } else {
      this.m_oEditSubscription.organizationId = this.m_oOrganization.organizationId;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.startDate)) {
      this.m_oEditSubscription.startDate = new Date(this.m_sStartDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.endDate)) {
      this.m_oEditSubscription.endDate = new Date(this.m_sEndDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.durationDays)) {
      this.m_oEditSubscription.durationDays = this.m_iDurationDays;
    }
  }


  initDates() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.buyDate)) {
      this.m_sBuyDate = null;
    } else {
      this.m_sBuyDate = new Date(this.m_oEditSubscription.buyDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.startDate)) {
      this.m_sStartDate = new Date();
    } else {
      this.m_sStartDate = new Date(this.m_oEditSubscription.startDate);
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oEditSubscription.endDate)) {
      this.m_sEndDate = new Date();

      if (this.m_oEditSubscription.typeId.toLowerCase().includes("day")) {
        this.m_sEndDate.setDate(this.m_sStartDate.getDate() + 1);
      } else if (this.m_oEditSubscription.typeId.toLowerCase().includes("week")) {
        this.m_sEndDate.setDate(this.m_sStartDate.getDate() + 7);
      } else if (this.m_oEditSubscription.typeId.toLowerCase().includes("month")) {
        this.m_sEndDate.setMonth(this.m_sStartDate.getMonth() + 1);
      } else if (this.m_oEditSubscription.typeId.toLowerCase().includes("year")) {
        this.m_sEndDate.setFullYear(this.m_sStartDate.getFullYear() + 1);
      }
    } else {
      this.m_sEndDate = new Date(this.m_oEditSubscription.endDate);
    }

    let lDifferenceInTime = this.m_sEndDate.getTime() - this.m_sStartDate.getTime();
    this.m_iDurationDays = lDifferenceInTime / (1000 * 3600 * 24);
    this.m_iDurationDays = Math.round(this.m_iDurationDays);
  }

  saveSubscription() {
    this.createSubscriptionObject()

    this.m_oSubscriptionService.saveSubscription(this.m_oEditSubscription).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)
          && !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.body) && oResponse.status === 200) {
          this.m_oEditSubscription.subscriptionId = oResponse.body.message;
          this.initSubscriptionInfo();
          this.initDates();
          if (this.m_bCheckoutNow === false) {
            this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("USER_SUBSCRIPTION_UPDATED"), '', 'success-snackbar');
          }
          //If creating a subscription:
          if (this.m_bCheckoutNow === true) {
            this.getStripePaymentUrl();
          }
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("USER_SUBSCRIPTION_SAVE_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.ERROR",), 'danger');
        }

        if (this.m_bIsPaid) {
          this.onDismiss();
        }
      },
      error: oError => {
        let sErrorMessage = this.m_oTranslate.instant("USER_SUBSCRIPTION_SAVE_ERROR");

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
          sErrorMessage += "<br><br>" + this.m_oTranslate.instant(oError.data.message);
        }

        this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, this.m_oTranslate.instant("KEY_PHRASES.ERROR",), 'danger');
      }
    })
  }

  getStripePaymentUrl() {
    let oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sActiveWorkspaceId = oActiveWorkspace == null ? null : oActiveWorkspace.workspaceId;

    this.m_oSubscriptionService.getStripePaymentUrl(this.m_oEditSubscription.subscriptionId, sActiveWorkspaceId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.message)) {
          this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("USER_SUBSCRIPTION_URL"), '', 'success-snackbar');

          let sUrl = oResponse.message;

          window.open(sUrl, '_blank');
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("USER_SUBSCRIPTION_URL_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'alert');
      }
    });
  }

  getOrganizationsListByUser() {
    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        if (oResponse.status !== 200) {
          this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("USER_SUBSCRIPTION_ORGANIZATION_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'alert');
        } else {
          const oFirstElement = { name: "No Organization", organizationId: null };
          this.m_aoOrganizations = [oFirstElement].concat(oResponse.body);
          this.m_aoOrganizationsMap = this.m_aoOrganizations.map(
            (item) => ({ name: item.name, organizationId: item.organizationId })
          );

          this.m_aoOrganizationsMap.forEach((oValue, sKey) => {
            if (oValue.organizationId == this.m_oEditSubscription.organizationId) {
              this.m_oOrganization = oValue;
            }
          });
        }
        this.m_bLoadingOrganizations = false;
      },
      error: oError => { }
    })
  }

  getOrganizationName(oOrganization) {
    return oOrganization && oOrganization.name ? oOrganization.name : "";
  }

  setSelectedOrganization(event) {
    this.m_aoOrganizations.forEach(oType => {
      if (oType.name === event.value.name) {
        this.m_oOrganization = oType;
      }
    });
  }

  getDaysRemaining(sStartDate: any, sEndDate: any) {
    let sCurrentDate = Date.now();
    let sEndTimestamp = Date.parse(sEndDate);

    let iRemaningDays = Math.ceil((sEndTimestamp - sCurrentDate) / (1000 * 3600 * 24));

    if (iRemaningDays <= 0) {
      this.m_iDaysRemaining = "Expired"
    } else {
      this.m_iDaysRemaining = iRemaningDays;
    }
  }

  checkout() {
    this.createSubscriptionObject();
    let sMessage = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_MSG");
    let sTitle = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationDisplayService.openConfirmationDialog(sMessage, sTitle, 'info').subscribe(oDialogResult => {
      if (oDialogResult === true) {
        if (!this.m_oEditSubscription.subscriptionId) {
          this.m_bCheckoutNow = true;
          this.saveSubscription();
        } else {
          this.getStripePaymentUrl();
        }
      }
    })
  }

  setNameInput(oEvent: any) {
    this.m_oEditSubscription.name = oEvent.event.target.value
  }
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
