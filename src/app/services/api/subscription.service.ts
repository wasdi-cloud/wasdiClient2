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
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/byuser');
  };

  getSubscriptionById(sSubscriptionId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/byId?subscription=' + sSubscriptionId);
  };

  saveSubscription(oSubscription) {
    if (!oSubscription.subscriptionId) {
      return this.createSubscription(oSubscription);
    } else {
      return this.updateSubscription(oSubscription);
    }
  };

  createSubscription(oSubscription) {
    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions/add', oSubscription, { observe: "response" });
  };

  updateSubscription(oSubscription) {
    return this.m_oHttp.put<any>(this.APIURL + '/subscriptions/update', oSubscription, { observe: "response" });
  };

  deleteSubscription(sSubscriptionId: string) {
    return this.m_oHttp.delete<any>(this.APIURL + '/subscriptions/delete?subscription=' + sSubscriptionId, { observe: "response" });
  };

  // Get list of shared users by subscription id
  getUsersBySharedSubscription(sSubscriptionId: string) {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/share/bysubscription?subscription=' + sSubscriptionId);
  }

  // Add sharing
  addSubscriptionSharing(sSubscriptionId: string, sUserId: string, sRights) {
    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions/share/add?subscription=' + sSubscriptionId + '&userId=' + sUserId + "&rights=" + sRights, {});
  }

  // Remove sharing
  removeSubscriptionSharing(sSubscriptionId: string, sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/subscriptions/share/delete?subscription=' + sSubscriptionId + '&userId=' + sUserId);
  }

  // Get Subscription Types list
  getSubscriptionTypes() {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/types', { observe: 'response' });
  };

  // Get Stripe payment url by subscription id
  getStripePaymentUrl(sSubscriptionId: string, sWorkspaceId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/stripe/paymentUrl?subscription=' + sSubscriptionId + '&workspace=' + sWorkspaceId);
  }
}
