import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { }

  getSubscriptionsListByUser() {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/byuser');
  };

  getSubscriptionById(sSubscriptionId: string) {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/byId?subscription=' + sSubscriptionId);
  };

  saveSubscription(oSubscription) {
    if (!oSubscription.subscriptionId) {
      return this.createSubscription(oSubscription);
    } else {
      return this.updateSubscription(oSubscription);
    }
  };

  createSubscription(oSubscription) {
    return this.m_oHttp.post(this.APIURL + '/subscriptions/add', oSubscription);
  };

  updateSubscription(oSubscription) {
    return this.m_oHttp.put(this.APIURL + '/subscriptions/update', oSubscription);
  };

  deleteSubscription(sSubscriptionId: string) {
    return this.m_oHttp.delete(this.APIURL + '/subscriptions/delete?subscription=' + sSubscriptionId);
  };

  // Get list of shared users by subscription id
  getUsersBySharedSubscription(sSubscriptionId: string) {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/share/bysubscription?subscription=' + sSubscriptionId);
  }

  // Add sharing
  addSubscriptionSharing(sSubscriptionId: string, sUserId: string) {
    return this.m_oHttp.post(this.APIURL + '/subscriptions/share/add?subscription=' + sSubscriptionId + '&userId=' + sUserId, {});
  }

  // Remove sharing
  removeSubscriptionSharing(sSubscriptionId: string, sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/subscriptions/share/delete?subscription=' + sSubscriptionId + '&userId=' + sUserId);
  }

  // Get Subscription Types list
  getSubscriptionTypes() {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/types');
  };

  // Get Stripe payment url by subscription id
  getStripePaymentUrl(sSubscriptionId: string, sWorkspaceId: string) {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/stripe/paymentUrl?subscription=' + sSubscriptionId + '&workspace=' + sWorkspaceId);
  }
}