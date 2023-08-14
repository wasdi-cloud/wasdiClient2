import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { ConstantsService } from 'src/app/services/constants.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-edit-subscription-dialog',
  templateUrl: './edit-subscription-dialog.component.html',
  styleUrls: ['./edit-subscription-dialog.component.css']
})
export class EditSubscriptionDialogComponent {
  faX = faX;

  m_sPurchaseDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number = 0;

  m_oEditSubscription: any;

  m_asOrganizations = [];
  m_aoOrganizationsMap = [];
  m_oOrganization: any = {};
  m_bLoadingOrganizations = true;

  m_bCheckoutNow = false;
  m_bIsPaid: boolean;
  m_bEditMode: boolean = true;

  m_oUserOrganizations: Array<any> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<EditSubscriptionDialogComponent>,
    private m_oOrganizationsService: OrganizationsService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService,
    // private m_oWindow: Window
  ) {
    this.m_oEditSubscription = this.m_oData.subscription;
    this.m_bEditMode = this.m_oData.editMode;
    this.initSubscriptionInfo();
    console.log(this.m_oEditSubscription);
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

  initSubscriptionInfo() {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditSubscription.subscriptionId)) {
      this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
      this.initDates();
      this.getOrganizationsListByUser();

    } else {

      this.m_oSubscriptionService.getSubscriptionById(this.m_oEditSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)
            && !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
            this.m_oEditSubscription = oResponse;
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

    let lDifferenceInTime = this.m_sEndDate.getTime() - this.m_sStartDate.getTime();
    this.m_iDurationDays = lDifferenceInTime / (1000 * 3600 * 24);
    this.m_iDurationDays = Math.round(this.m_iDurationDays);
  }

  selectDate() { }

  saveSubscription() {
    this.createSubscriptionObject();
    this.m_oSubscriptionService.saveSubscription(this.m_oEditSubscription).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)
          && !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          this.m_oEditSubscription.subscriptionId = oResponse.message;
          this.initSubscriptionInfo();
          this.initDates();
          //If creating a subscription:
          if (this.m_bCheckoutNow === true) {
            //let oDialog = FadeoutUtils.utilsVexDialogAlertBottomRightCorner("SUBSCRIPTION SAVED<br>REDIRECTING TO PAYMENT");
            //FadeoutUtils.utilsVexCloseDialogAfter(4000, oDialog);

            this.getStripePaymentUrl();
          }
        } else {
          //FadeoutUtils.utilsVexDialogAlertTop("GURU MEDITATION<br>ERROR IN SAVING SUBSCRIPTION");
        }

        if (this.m_bIsPaid) {
          //oController.m_oScope.close();
        }
      },
      error: oError => {
        let sErrorMessage = "GURU MEDITATION<br>ERROR IN SAVING SUBSCRIPTION";

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
          sErrorMessage += "<br><br>" + this.m_oTranslate.instant(oError.data.message);
        }

        //utilsVexDialogAlertTop(sErrorMessage);

        if (this.m_bIsPaid) {
          //oController.m_oScope.close();
        }
      }
    })
  }

  getStripePaymentUrl() {
    let oController = this;

    let oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sActiveWorkspaceId = oActiveWorkspace == null ? null : oActiveWorkspace.workspaceId;

    this.m_oSubscriptionService.getStripePaymentUrl(this.m_oEditSubscription.subscriptionId, sActiveWorkspaceId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.message) {
          // let oDialog = utilsVexDialogAlertBottomRightCorner("PAYMENT URL RECEIVED<br>READY");
          // utilsVexCloseDialogAfter(4000, oDialog);

          let sUrl = oResponse.message;

          // oController.m_oWindow.open(sUrl, '_blank');
        }
      },
      error: oError => {
        //utilsVexDialogAlertTop("GURU MEDITATION<br>ERROR IN RETRIEVING THE PAYMENT URL");
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

  getOrganizationsListByUser() { }

  getDaysRemaining(sStartDate: any, sEndDate: any) { }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
