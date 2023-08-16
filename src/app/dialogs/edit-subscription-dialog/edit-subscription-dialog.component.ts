import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { ConstantsService } from 'src/app/services/constants.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-edit-subscription-dialog',
  templateUrl: './edit-subscription-dialog.component.html',
  styleUrls: ['./edit-subscription-dialog.component.css']
})
export class EditSubscriptionDialogComponent implements OnInit {
  //Font Awesome Imports:
  faX = faX;

  //Organizations Properties:
  m_aoOrganizations: any = [];
  m_aoUserOrganizations: any = [];
  m_oOrganization: any = {};
  m_bLoadingOrganizations: boolean = true;

  //Date Properties:
  m_sPurchaseDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number;

  //Inputted Subscription:
  m_oEditSubscription: any;

  //State Booleans:
  m_bCheckoutNow: boolean = false;
  m_bIsPaid: boolean = true;
  m_bEditMode: boolean = true;
  m_bIsOwner: boolean = true;


  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<EditSubscriptionDialogComponent>,
    private m_oNotificationService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService,
    // private m_oWindow: Window
  ) {

    // this.m_bEditMode = this.m_oData.editMode;
    // this.initSubscriptionInfo();
    // console.log(this.m_oEditSubscription);
  }

  ngOnInit(): void {
    //Set Subscription Information from Dialog Data:
    this.m_oEditSubscription = this.m_oData.subscription;
    if (this.m_oData.subscription.adminRole !== undefined) {
      this.m_bIsOwner = this.m_oData.subscription.adminRole;
    }
    this.m_bEditMode = this.m_oData.editMode;
    this.initSubscriptionInfo();
    console.log(this.m_oEditSubscription);
  }

  /**
   * Initialize the Edit Subscription Information:
   */
  initSubscriptionInfo() {
    //If no subscription ID (i.e., creating a new subscription): 
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditSubscription.subscriptionId)) {
      this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
      this.initDates();
      this.getOrganizationsListByUser();

    } else {
      this.m_oSubscriptionService.getSubscriptionById(this.m_oEditSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.status === 200) {
            this.m_oEditSubscription = oResponse.body;
            this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
            this.initDates();
            this.getOrganizationsListByUser();
            this.getDaysRemaining(this.m_oEditSubscription.startDate, this.m_oEditSubscription.endDate);
          } else {
            // utilsVexDialogAlertTop(
            //     "GURU MEDITATION<br>ERROR IN GETTING THE SUBSCRIPTION BY ID"
            // );
          }
        },
        error: oError => {
          let sErrorMessage = "GURU MEDITATION<br>ERROR IN FETCHING THE SUBSCRIPTION";

          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.message)) {
            sErrorMessage += "<br><br>" + this.m_oTranslate.instant(oError.message);
          }

          //utilsVexDialogAlertTop(sErrorMessage);
        }
      });
    }
  }


  createSubscriptionObject() {
    if (!this.m_oEditSubscription.name) {
      this.m_oEditSubscription.name = this.m_oEditSubscription.typeName;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganization.organizationId)) {
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
      this.m_sPurchaseDate = null;
    } else {
      this.m_sPurchaseDate = new Date(this.m_oEditSubscription.buyDate);
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

    let iDifferenceInTime = this.m_sEndDate.getTime() - this.m_sStartDate.getTime();
    this.m_iDurationDays = iDifferenceInTime / (1000 * 3600 * 24);
    this.m_iDurationDays = Math.round(this.m_iDurationDays);
  }

  saveSubscription() {
    this.createSubscriptionObject();
    this.getStripePaymentUrl();
    this.m_oSubscriptionService.saveSubscription(this.m_oEditSubscription).subscribe({
      next: oResponse => {
        console.log(oResponse)
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          this.m_oEditSubscription.subscriptionId = oResponse.body.message;
          this.initSubscriptionInfo();
          this.initDates();
          //If creating a subscription:
          if (this.m_bCheckoutNow === true) {
            this.m_oAlertDialog.openDialog(4000, "SUBSCRIPTION SAVED - REDIRECTING TO PAYMENT")
            this.getStripePaymentUrl();
          }
        } else {
          this.m_oAlertDialog.openDialog(4000, "ERROR IN SAVING YOUR SUBSCRIPTION");
        }

        if (this.m_bIsPaid) {
          this.onDismiss();
        }
      },
      error: oError => {
        let sErrorMessage = "GURU MEDITATION<br>ERROR IN SAVING SUBSCRIPTION";

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
          sErrorMessage += "<br><br>" + this.m_oTranslate.instant(oError.data.message);
        }
        this.m_oAlertDialog.openDialog(4000, sErrorMessage);

        if (this.m_bIsPaid) {
          this.onDismiss();
        }
      }
   })
  }

  getStripePaymentUrl() {
    let oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sActiveWorkspace; 
    if(oActiveWorkspace.workspaceId === undefined) {
      sActiveWorkspace = null;
    } else {
      sActiveWorkspace = oActiveWorkspace;
    }
    
    this.m_oSubscriptionService.getStripePaymentUrl(this.m_oEditSubscription.subscriptionId, sActiveWorkspace).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.message) {
          this.m_oNotificationService.openSnackBar("PAYMENT URL RECEIVED - REDIRECTING", "Close", "bottom", "right");
          let sUrl = oResponse.message;

          window.open(sUrl, "_blank");
          this.onDismiss();
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "ERROR IN RETRIEVING THE PAYMENT URL");
        this.onDismiss();
      }
    });
  }

  checkout() {
    let oController = this;
    let sMessage = "You will be re-directed to our payment partner, Stripe. Click 'OK' to continue or 'CANCEL' to end the payment process."
    //Notification that user will be re-directed to Stripe
    let oDialogData = new ConfirmationDialogModel("Confirm Redirect", sMessage);
    let oDialog = this.m_oDialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: oDialogData
    });
    oDialog.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        if (!this.m_oEditSubscription.subscriptionId) {
          this.m_bCheckoutNow = true;
          this.saveSubscription();
        } else {
          this.getStripePaymentUrl();
        }
      }
    });
  }

  getOrganizationsListByUser() {
    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) || oResponse.status !== 200) {
          this.m_oAlertDialog.openDialog(4000, "Error getting your organizations!");
        } else {
          const oFirstElement = { name: "No Organization", organizationId: null };
          this.m_aoOrganizations = [oFirstElement].concat(oResponse.body);
          this.m_aoOrganizations.forEach((oValue, sKey) => {
            if (oValue.organizationId === this.m_oEditSubscription.organizationId) {
              this.m_oOrganization = oValue;
            }
          });
        }
        this.m_bLoadingOrganizations = false;
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "Error getting your organizations!");
        this.m_bLoadingOrganizations = false;
      }
    })
  }

  getOrganizationName(oOrganization) {
    return oOrganization && oOrganization.name ? oOrganization.name : "";
  }

  setSelectedOrganization(event) {
    this.m_aoOrganizations.forEach(oType => {
      if (oType.name === event.option.value.name) {
        this.m_oOrganization = oType;
      }
    });
  }

  getDaysRemaining(sStartDate: any, sEndDate: any) {
    let sCurrentDate = Date.now();
    let sEndTimeStamp = Date.parse(sEndDate);

    let iRemainingDays = Math.ceil((sEndTimeStamp - sCurrentDate) / (1000 * 3600 * 24));

    if (iRemainingDays <= 0) {
      this.m_iDaysRemaining = 0;
    } else {
      this.m_iDaysRemaining = iRemainingDays;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
