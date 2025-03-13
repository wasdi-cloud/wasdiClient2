import { Component, Inject, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { CreditsService } from 'src/app/services/api/credits.service'; 
import { TranslateService } from '@ngx-translate/core';


import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-credits-buy-dialog',
  templateUrl: './credits-buy-dialog.component.html',
  styleUrls: ['./credits-buy-dialog.component.css']
})
export class CreditsBuyDialogComponent implements OnInit {
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

  //Information passed from opening dialog
  m_oDialogInput: any;

  // Credit Package View Model
  m_oCreditPackageViewModel: any;

  //State Booleans:
  m_bCheckoutNow: boolean = false;
  m_bIsPaid: boolean = true;
  m_bEditMode: boolean = true;
  m_bIsOwner: boolean = true;


  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<CreditsBuyDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oCreditsService: CreditsService,
    private m_oTranslate: TranslateService,
  ) { }

  ngOnInit(): void {
    //Set Credit Package Information from Dialog Data:
    this.m_oDialogInput = this.m_oData.creditPackage;
    this.m_bEditMode = this.m_oData.editMode;

    this.initCreditPackageInfo();
  }

  /**
   * Initialize the Credit Package Information:
   */
  initCreditPackageInfo() {

    // Initialize if paid or not
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oDialogInput.creditPackageId)) {
      this.m_bIsPaid = this.m_oDialogInput.buySuccess;
    } 

    this.m_oCreditPackageViewModel = {
      buySuccess: false,
      price: 0,
      creditPackageId: null,
      type: "",
      description: "",
      userId: "",
      name: "",
      buyDate: "",
      creditsRemaining: 0,
      lastUpdate: 0
    };

    this.m_oCreditPackageViewModel.creditPackageId = this.m_oDialogInput.creditPackageId;
    this.m_oCreditPackageViewModel.name = this.m_oDialogInput.name;
    this.m_oCreditPackageViewModel.description = this.m_oDialogInput.description;
    this.m_oCreditPackageViewModel.type = this.m_oDialogInput.type;
    this.m_oCreditPackageViewModel.buyDate = this.m_oDialogInput.buyDate;

    this.m_oCreditPackageViewModel.buySuccess = this.m_oDialogInput.buySuccess;
    this.m_oCreditPackageViewModel.creditsRemaining = this.m_oDialogInput.creditsRemaining;
    this.m_oCreditPackageViewModel.lastUpdate = this.m_oDialogInput.lastUpdate;
  }

  saveCreditPackage() {
    if (!this.m_oDialogInput.name) {
      this.m_oCreditPackageViewModel.name = this.m_oDialogInput.typeName;
    }

    
    this.m_oCreditsService.createCreditsPackage(this.m_oCreditPackageViewModel).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)
          && !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.body) && oResponse.status === 200) {
          this.m_oCreditPackageViewModel.creditPackageId = oResponse.body.message;
          
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

    this.m_oCreditsService.getStripePaymentUrl(this.m_oCreditPackageViewModel.creditPackageId, sActiveWorkspaceId).subscribe({
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

  checkout() {

    if (!this.m_oDialogInput.name) {
      this.m_oCreditPackageViewModel.name = this.m_oDialogInput.typeName;
    }

    let sMessage = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_MSG");
    let sTitle = this.m_oTranslate.instant("USER_SUBSCRIPTION_STRIPE_TITLE");
    //Notification that user will be re-directed to Stripe
    this.m_oNotificationDisplayService.openConfirmationDialog(sMessage, sTitle, 'info').subscribe(oDialogResult => {
      if (oDialogResult === true) {
        if (!this.m_oDialogInput.creditPackageId) {
          this.m_bCheckoutNow = true;
          this.saveCreditPackage();
        } else {
          this.getStripePaymentUrl();
        }
      }
    })
  }

  setNameInput(oEvent: any) {
    this.m_oCreditPackageViewModel.name = oEvent.event.target.value
  }
  onDismiss() {
    this.m_oDialogRef.close();
  }
}