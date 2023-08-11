import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'src/app/services/api/subscription.service';
import { ConstantsService } from 'src/app/services/constants.service';

import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
  selector: 'app-subscriptions-purchase',
  templateUrl: './subscriptions-purchase.component.html',
  styleUrls: ['./subscriptions-purchase.component.css']
})
export class SubscriptionsPurchaseComponent implements OnInit{
  m_aoTypes: any = [];
  m_aoTypesMap: Array<any> = [];
  m_oType: any = {};

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oSubscriptionsService: SubscriptionService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
      this.getSubscriptionTypes(); 
  }

  showSubscriptionAddForm(oType: any, price: number) { }

  getSubscriptionTypes() { 
    this.m_oSubscriptionsService.getSubscriptionTypes().subscribe({
      next: oResponse => {
        if(!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          this.m_aoTypes = oResponse.body;
          console.log(this.m_aoTypes)
        }
      }, 
      error: oError => {}
    })
  }
}
