import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {

  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { }

  /**
   * Get the list of credit packages
   * @returns
   */
  getCreditPackages() {
    return this.m_oHttp.get<any>(this.APIURL + '/credits/types');
  };


  /**
   * Create the buy request for a credit package
   * @param oCreditPackage
   * @returns
   */
    createCreditsPackage(oCreditPackage) {
      return this.m_oHttp.post<any>(this.APIURL + '/credits/add', oCreditPackage, { observe: "response" });
    };

  /**
   * Get Stripe payment url by credit package id
   * @param sCreditPackageId
   * @param sWorkspaceId
   * @returns
   */
  getStripePaymentUrl(sCreditPackageId: string, sWorkspaceId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/credits/stripe/paymentUrl?creditPackageId=' + sCreditPackageId);
  }

  /**
   * Get the list of credit packages
   * @returns
   */
  getListByUser(bAscendingOrder: boolean) {
    let sBool = "true";
    if (!bAscendingOrder) sBool = "false";

    return this.m_oHttp.get<any>(this.APIURL + '/credits/listbyuser?ascendingOrder='+sBool);
  };

  /**
   * Get the credits of the actual user
   * @returns
   */
  getCreditsByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/credits/totalbyuser');
  };

  confirmCreditPayment(m_sCheckoutCode: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/credits/stripe/confirmation/'+m_sCheckoutCode);
  }
}
