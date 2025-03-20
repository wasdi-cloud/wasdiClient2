import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SubscriptionService} from "../../../services/api/subscription.service";
import {NotificationDisplayService} from "../../../services/notification-display.service";
import FadeoutUtils from "../../../lib/utils/FadeoutJSUtils";
import {CreditsService} from "../../../services/api/credits.service";

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  host: { 'class': 'flex-fill' }
})
export class PaymentSuccessComponent implements OnInit{
  m_sCheckoutCode:string;
  m_bCanProceed:boolean=false;
  m_bIsCredit:boolean=false;


  constructor(
    private m_oActiveRoute: ActivatedRoute,
    private m_oSubscriptionService: SubscriptionService,
    private m_oCreditService: CreditsService,
    private m_oNotificationService: NotificationDisplayService,
    private m_oRouter: Router,
  ) {

  }

  ngOnInit() {
    this.m_oActiveRoute.paramMap.subscribe((params) => {
      this.m_sCheckoutCode = params.get('CHECKOUT_SESSION_ID'); // Fetch from route params
      this.m_oActiveRoute.queryParamMap.subscribe((queryParams) => {
        this.m_bIsCredit = queryParams.get('credit') === 'true'; // Convert to boolean}
        if(this.m_bIsCredit){
          //credit payment
          if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sCheckoutCode)) {
            this.m_oCreditService.confirmCreditPayment(this.m_sCheckoutCode).subscribe(
              {
                next: (oResponse) => {
                    this.m_bCanProceed = true;


                },
                error: (oError) => {

                  this.m_bCanProceed = false;
                  this.m_oNotificationService.openSnackBar(
                    "Something went wrong",
                    "Error",
                    "danger"
                  );
                }
              }
            );
          }
        }else{
          // sub payment
          if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sCheckoutCode)) {
            this.m_oSubscriptionService.confirmSubscription(this.m_sCheckoutCode).subscribe(
              {
                next: (oResponse) => {
                  this.m_bCanProceed = true;

                },
                error: (oError) => {

                  this.m_bCanProceed = false;
                  this.m_oNotificationService.openSnackBar(
                    "Something went wrong",
                    "Error",
                    "danger"
                  );
                }
              }
            );
          }
        }
      })

    });
  }


  marketplaceRedirect() {
    this.m_oRouter.navigateByUrl('/marketplace');
  }

  protected readonly caches = caches;
}
