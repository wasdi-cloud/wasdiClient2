import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { }

  /**
   * Get the list of subscriptions of a user
   * @returns 
   */
  getSubscriptionsListByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/byuser');
  };

  /**
   * Get Subscription Details
   * @param sSubscriptionId 
   * @returns 
   */
  getSubscriptionById(sSubscriptionId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/byId?subscription=' + sSubscriptionId);
  };

  /**
   * Creates or updates a subscription
   * @param oSubscription 
   * @returns 
   */
  saveSubscription(oSubscription) {
    if (!oSubscription.subscriptionId) {
      return this.createSubscription(oSubscription);
    } else {
      return this.updateSubscription(oSubscription);
    }
  };

  /**
   * Create Subscription
   * @param oSubscription 
   * @returns 
   */
  createSubscription(oSubscription) {
    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions/add', oSubscription, { observe: "response" });
  };

  /**
   * Update Subscription
   * @param oSubscription 
   * @returns 
   */
  updateSubscription(oSubscription) {
    return this.m_oHttp.put<any>(this.APIURL + '/subscriptions/update', oSubscription, { observe: "response" });
  };

  /**
   * Delete Subscription
   * @param sSubscriptionId 
   * @returns 
   */
  deleteSubscription(sSubscriptionId: string) {
    return this.m_oHttp.delete<any>(this.APIURL + '/subscriptions/delete?subscription=' + sSubscriptionId, { observe: "response" });
  };

  /**
   * Get list of shared users by subscription id
   * @param sSubscriptionId 
   * @returns 
   */
  getUsersBySharedSubscription(sSubscriptionId: string) {
    return this.m_oHttp.get(this.APIURL + '/subscriptions/share/bysubscription?subscription=' + sSubscriptionId);
  }

  /**
   * Add sharing
   * @param sSubscriptionId 
   * @param sUserId 
   * @param sRights 
   * @returns 
   */
  addSubscriptionSharing(sSubscriptionId: string, sUserId: string, sRights) {
    return this.m_oHttp.post<any>(this.APIURL + '/subscriptions/share/add?subscription=' + sSubscriptionId + '&userId=' + sUserId + "&rights=" + sRights, {});
  }

  /**
   * Remove sharing
   * @param sSubscriptionId 
   * @param sUserId 
   * @returns 
   */
  removeSubscriptionSharing(sSubscriptionId: string, sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/subscriptions/share/delete?subscription=' + sSubscriptionId + '&userId=' + sUserId);
  }

  /**
   * Get Subscription Types list
   * @returns 
   */
  getSubscriptionTypes() {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/types', { observe: 'response' });
  };

  /**
   * Get Stripe payment url by subscription id
   * @param sSubscriptionId 
   * @param sWorkspaceId 
   * @returns 
   */
  getStripePaymentUrl(sSubscriptionId: string, sWorkspaceId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/subscriptions/stripe/paymentUrl?subscription=' + sSubscriptionId + '&workspace=' + sWorkspaceId);
  }

  getPaginatedSubscriptions(sUserFilter: string, sIdFilter: string, sNameFilter: string, iOffset: number, iLimit: number) {
    let bQuestionMarkAdded = false;
    let sUrl = this.APIURL + "/subscriptions/list"

    // if (FadeoutUtils.utilsIsStrNullOrEmpty(sUserFilter)) {
    //   if (!bQuestionMarkAdded) {
    //     sUrl += "?"
    //     bQuestionMarkAdded = true;
    //   }
    //   else {
    //     sUrl += "&";
    //   }
    //   sUrl += "userfilter=" + sUserFilter;
    // }

    // if (iOffset != null) {
    //   if (!bQuestionMarkAdded) {
    //     sUrl += "?"
    //     bQuestionMarkAdded = true;
    //   }
    //   else {
    //     sUrl += "&";
    //   }
    //   sUrl += "offset=" + iOffset;
    // }

    // if (iLimit != null) {
    //   if (!bQuestionMarkAdded) {
    //     sUrl += "?"
    //     bQuestionMarkAdded = true;
    //   }
    //   else {
    //     sUrl += "&";
    //   }
    //   sUrl += "limit=" + iLimit;
    // }


    // if (FadeoutUtils.utilsIsStrNullOrEmpty(sIdFilter)) {
    //   if (!bQuestionMarkAdded) {
    //     sUrl += "?"
    //     bQuestionMarkAdded = true;
    //   }
    //   else {
    //     sUrl += "&";
    //   }
    //   sUrl += "idfilter=" + sIdFilter;
    // }

    // if (FadeoutUtils.utilsIsStrNullOrEmpty(sNameFilter)) {
    //   if (!bQuestionMarkAdded) {
    //     sUrl += "?"
    //     bQuestionMarkAdded = true;
    //   }
    //   else {
    //     sUrl += "&";
    //   }
    //   sUrl += "namefilter=" + sNameFilter;
    // }

    return this.m_oHttp.get<Array<any>>(`${sUrl}?userfilter=${sUserFilter}&offset=${iOffset}&limit=${iLimit}&idfilter=${sIdFilter}&namefilter=${sNameFilter}`);
  }
}
