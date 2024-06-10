import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { ConstantsService } from 'src/app/services/constants.service';

import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MatDialog } from '@angular/material/dialog';
import { EditSubscriptionDialogComponent } from 'src/app/dialogs/edit-subscription-dialog/edit-subscription-dialog.component';
@Component({
  selector: 'app-subscriptions-purchase',
  templateUrl: './subscriptions-purchase.component.html',
  styleUrls: ['./subscriptions-purchase.component.css'],
  host: { 'class': 'flex-fill' }
})
export class SubscriptionsPurchaseComponent implements OnInit {
  m_aoTypes: any = [];
  m_aoTypesMap: Array<any> = [];
  m_oStndType: any = {};
  m_oProType: any = {};
  m_sSelectedPriceContainer: string = 'stnd';
  m_sActiveStndPrice: string = 'day';
  m_sActiveProPrice: string = 'month';
  m_iStndPrice: number = 50;
  m_iProPrice: number = 2000;


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oOrganizationsService: OrganizationsService,
    private m_oSubscriptionsService: SubscriptionService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getSubscriptionTypes();
  }

  showSubscriptionAddForm(oType: any, price: number) {
    let oNewSubscription = {
      buySuccess: false,
      price: price,
      subscriptionId: null,
      typeId: oType.typeId,
      typeName: oType.name,
    };
    this.m_oDialog.open(EditSubscriptionDialogComponent, {
      maxHeight: '80vh',
      width: '50vw',
      data: {
        subscription: oNewSubscription,
        editMode: true
      }

    })
  }

  getSubscriptionTypes() {
    this.m_oSubscriptionsService.getSubscriptionTypes().subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          this.m_aoTypes = oResponse.body;
          this.m_oStndType = this.m_aoTypes[1];
          this.m_oProType = this.m_aoTypes[5];
        }
      },
      error: oError => { }
    })
  }

  setActivePriceContainer(sInput: string) {
    this.m_sSelectedPriceContainer = sInput;
  }

  /**
   * 
   * @param sTime represents the time for the subscription (i.e., Day, Month, Year)
   * @param sTier represents which subscription tier selected (i.e., Standard or Professional)
   * @param oType represents the subscription type from the m_aoTypes array
   */
  setActivePrice(sTime: string, sTier: string, oType: any): void {
    if (sTier === 'stnd') {
      this.m_sActiveStndPrice = sTime;
      if (sTime === 'day') {
        this.m_iStndPrice = 50;
      } else if (sTime === 'week') {
        this.m_iStndPrice = 150;
      } else if (sTime === 'month') {
        this.m_iStndPrice = 500;
      } else {
        this.m_iStndPrice = 5000;
      }
      this.m_oStndType = oType;
    } else {
      this.m_sActiveProPrice = sTime
      if (sTime === 'month') {
        this.m_iProPrice = 2000;
      } else {
        this.m_iProPrice = 20000;
      }
      this.m_oProType = oType;
    }
  }
}
