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
  styleUrls: ['./subscriptions-purchase.component.css']
})
export class SubscriptionsPurchaseComponent implements OnInit {
  m_aoTypes: any = [];
  m_aoTypesMap: Array<any> = [];
  m_oType: any = {};

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
        }
      },
      error: oError => { }
    })
  }
}
