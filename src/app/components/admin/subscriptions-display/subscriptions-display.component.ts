import { Component, Input, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { ProjectService } from 'src/app/services/api/project.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MatDialog } from '@angular/material/dialog';
import { EditSubscriptionDialogComponent } from 'src/app/dialogs/edit-subscription-dialog/edit-subscription-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { SubscriptionProjectsDialogComponent } from 'src/app/dialogs/subscription-projects-dialog/subscription-projects-dialog.component';
import { TranslateService } from '@ngx-translate/core';

import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-subscriptions-display',
  templateUrl: './subscriptions-display.component.html',
  styleUrls: ['./subscriptions-display.component.css']
})
export class SubscriptionsDisplayComponent implements OnInit {
  m_bLoadingOrganizations: boolean = true;
  m_bLoadingSubscriptions: boolean = true;
  m_bLoadingProjects: boolean = true;
  m_bIsLoading: boolean = true;

  m_aoSubscriptions: Array<any> = [];
  m_aoSubscriptionsProjects: Array<any> = [];

  m_oUser = this.m_oConstantsService.getUser();

  m_bShowForm: boolean = true;
  //Organizations Properties:
  @Input() m_aoOrganizations: Array<any> = [];
  m_aoOrganizationsMap: any = [];
  m_asOrganizations: any = [];
  m_aoUserOrganizations: any = [];
  m_oOrganization: any = {};
  m_oSelectedOrganization: any;

  //Date Properties:
  m_sBuyDate: string | Date = "";
  m_sStartDate: Date;
  m_sEndDate: Date;
  m_iDurationDays: number = 0;
  m_iDaysRemaining: number | string = 'Expired';

  //Susbscription Information passed from opening dialog
  m_oEditSubscription: any;

  m_oActiveSubscription: any = null;

  //State Booleans:
  m_bCheckoutNow: boolean = false;
  m_bIsPaid: boolean = true;
  m_bEditMode: boolean = true;
  m_bIsOwner: boolean = true;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initializeSubscriptionsInfo();

  }

  initializeSubscriptionsInfo() {
    this.m_oSubscriptionService.getSubscriptionsListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoSubscriptions = oResponse;
        }
      },
      error: oError => { }
    })
  }

  openSharedUsersDialog(oSubscription) {
    let oDialogData = new ShareDialogModel("subscription", oSubscription);
    this.m_oDialog.open(ShareDialogComponent, {
      height: '65vh',
      width: '60vw',
      data: oDialogData
    });
  }

  openProjectsDialog(bIsOwner: boolean, oSubscription: any) {
    let oDialogRef = this.m_oDialog.open(SubscriptionProjectsDialogComponent, {
      height: '70vh',
      width: '70vw',
      data: {
        subscription: oSubscription
      }
    })
  }

  openEditSubscriptionDialog(oSubscription: any, bIsOwner: boolean) {
    let oDialogRef = this.m_oDialog.open(EditSubscriptionDialogComponent, {
      height: '80vh',
      width: '50vw',
      data: {
        subscription: oSubscription,
        editMode: true,
        isOwner: bIsOwner
      }
    })
  }

  deleteSubscription(oSubscription) {
    let sConfirmTitle: string = this.m_oTranslate.instant("USER_SUBSCRIPTIONS_REMOVE_TITLE");
    let sConfirmationMessage: string = this.m_oTranslate.instant("USER_SUBSCRIPTIONS_REMOVE_MSG") + `<li>${oSubscription.name}</li>`;

    let oConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage, sConfirmTitle, "alert");

    oConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oSubscriptionService.deleteSubscription(oSubscription.subscriptionId).subscribe({
          next: oResponse => {
            let sSuccessTitle: string = this.m_oTranslate.instant("KEY_PHRASES.SUCCESS");
            let sErrorTitle: string = this.m_oTranslate.instant("KEY_PHRASES.ERROR");
            let sMessage = this.m_oTranslate.instant("USER_SUBSCRIPTION_REMOVE_MSG");
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.status === 200) {
              if (oResponse.body.message !== "Done") {
                sMessage += "<br><br>" + this.m_oTranslate.get(oResponse.body.message).subscribe(oTranslation => {
                  return oTranslation
                });
                this.m_oNotificationDisplayService.openAlertDialog(sMessage, sErrorTitle, 'danger');
              }

              this.m_oNotificationDisplayService.openSnackBar(sMessage, sSuccessTitle, 'success-snackbar');
              this.initializeSubscriptionsInfo();
            }
          },
          error: oError => {
            let sErrorTitle: string = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
            let sErrorMessage = this.m_oTranslate.instant("USER_SUBSCRIPTIONS_REMOVE_ERROR_MSG");

            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
              sErrorMessage += "<br>" + this.m_oTranslate.get(oError.data.message).subscribe(oTranslation => {
                return oTranslation;
              });
            }
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage, sErrorTitle, 'danger');
          }
        })
      }
    })
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

  saveSubscription() {
    let sTitle = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION");
    let sErrorMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_SAVE_ERROR")
    this.createSubscriptionObject()
    this.m_oSubscriptionService.saveSubscription(this.m_oEditSubscription).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)
          && !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.body) && oResponse.status === 200) {
          this.m_oEditSubscription.subscriptionId = oResponse.body.message;
          // this.initSubscriptionInfo();
          this.initDates();
          if (this.m_bCheckoutNow === false) {
            let sAlertMsg: string = this.m_oTranslate.instant("USER_SUBSCRIPTION_UPDATED")
            this.m_oNotificationDisplayService.openAlertDialog(sAlertMsg, "", 'success-snackbar');
          }
          //If creating a subscription:
          if (this.m_bCheckoutNow === true) {
            this.getStripePaymentUrl();
          }
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sTitle, 'danger')
        }
      },
      error: oError => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
          sErrorMsg += "<br>" + this.m_oTranslate.instant(oError.data.message);
        }
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sTitle, 'danger')
      }
    })
  }

  getStripePaymentUrl() {
    let oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sActiveWorkspaceId = oActiveWorkspace == null ? null : oActiveWorkspace.workspaceId;

    this.m_oSubscriptionService.getStripePaymentUrl(this.m_oEditSubscription.subscriptionId, sActiveWorkspaceId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.message)) {
          let sMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_URL")
          this.m_oNotificationDisplayService.openSnackBar(sMsg, '', 'success-snackbar');

          let sUrl = oResponse.message;

          window.open(sUrl, '_blank');
        }
      },
      error: oError => {
        let sMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_URL_ERROR")
        this.m_oNotificationDisplayService.openSnackBar(sMsg, '', 'danger-snackbar');
      }
    });
  }

  setActiveSubscription(oSubscription: any | null): void {
    this.m_oEditSubscription = oSubscription;
    if (oSubscription) {
      this.initEditSubscriptionInfo();
    }
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
    let sEndTimestamp = Date.parse(sEndDate);

    let iRemaningDays = Math.ceil((sEndTimestamp - sCurrentDate) / (1000 * 3600 * 24));

    if (iRemaningDays <= 0) {
      this.m_iDaysRemaining = "Expired"
    } else {
      this.m_iDaysRemaining = `${iRemaningDays}`;
    }
  }

  checkout() {
    this.createSubscriptionObject();
    let sMessage = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_MSG");
    let sTitle = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sMessage, sTitle, 'info');

    bConfirmResult.subscribe(oDialogResult => {
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

  initEditSubscriptionInfo() {
    let sErrorMsg = this.m_oTranslate.instant("USER_SUBSCRIPTION_ID_ERROR");
    let sTitle = this.m_oTranslate.instant("KEY_PHRASES.ERROR");
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditSubscription.subscriptionId)) {
      this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
      this.initDates();
    } else {
      this.m_oSubscriptionService.getSubscriptionById(this.m_oEditSubscription.subscriptionId).subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oEditSubscription = oResponse;
            this.m_bIsPaid = this.m_oEditSubscription.buySuccess;
            this.initDates();
            this.getDaysRemaining(this.m_oEditSubscription.startDate, this.m_oEditSubscription.endDate)
          } else {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sTitle, 'alert');
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sTitle, 'alert');
        }
      });
    }
  }

  getInput(oEvent, sLabel) {
    if (sLabel === 'name') {
      this.m_oEditSubscription.name = oEvent.event.target.value;
    } else if (sLabel === 'description') {
      this.m_oEditSubscription.description = oEvent.target.value;
    } else if (sLabel === 'organization') {
      this.m_oEditSubscription.organizationId = oEvent.value.organizationId;
      this.m_oEditSubscription.organizationName = oEvent.value.name;
    }

  }
}
