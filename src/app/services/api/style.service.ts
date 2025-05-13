import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { oConfirmation } from './workspace.service';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  // Upload a style by file
  uploadFile(sName: string, sDescription: string, oBody: object, bIsPublic: boolean) {
    return this.oHttp.post<oConfirmation>(this.APIURL + '/styles/uploadfile?' + "name=" + sName +
      "&description=" + sDescription + "&public=" + bIsPublic, oBody, {});
  };

  // Update style xml file
  updateStyleFile(sStyleId: string, oBody: object) {
    return this.oHttp.post(this.APIURL + '/styles/updatefile?styleId=' + sStyleId, oBody);
  }

  // Update style parameters
  updateStyleParameters(sStyleId: string, sDescription: string, bIsPublic: boolean) {
    return this.oHttp.post<any>(this.APIURL + '/styles/updateparams?styleId=' + sStyleId +
      '&description=' + sDescription + '&public=' + bIsPublic, null);
  }

  // Delete style
  deleteStyle(sStyleId: string) {
    return this.oHttp.delete(this.APIURL + '/styles/delete?styleId=' + sStyleId);
  };

  // Get Style list by user
  getStylesByUser() {
    return this.oHttp.get<any>(this.APIURL + '/styles/getbyuser');
  };

  // Download style file --> sUrl was set to null 
  downloadStyle(sStyleId: string, sUrl: string) {
    let urlParams: string = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "styleId=" + sStyleId;

    let sAPIUrl = this.APIURL;

    // Download styles is not a distributed API
    // if (typeof sUrl !== "undefined") {
    //   if (sUrl !== null) {
    //     if (sUrl !== "") {
    //       sAPIUrl = sUrl;
    //     }
    //   }
    // }

    window.location.href = sAPIUrl + "/styles/download" + urlParams;
  };

  /************************************ SHARINGS **************************************************/

  // Get list of shared users by style id
  getUsersBySharedStyle(sStyleId: string) {
    return this.oHttp.get(this.APIURL + '/styles/share/bystyle?styleId=' + sStyleId);
  }

  // Add sharing
  addStyleSharing(sStyleId: string, sUserId: string, sRights: string) {
    //Requires an argument for the body
    return this.oHttp.put<oConfirmation>(this.APIURL + '/styles/share/add?styleId=' + sStyleId + '&userId=' + sUserId + '&rights=' + sRights, {});
  }

  // Remove sharing
  removeStyleSharing(sStyleId: string, sUserId: string) {
    return this.oHttp.delete<oConfirmation>(this.APIURL + '/styles/share/delete?styleId=' + sStyleId + '&userId=' + sUserId);

  }

  // Get style xml
  getStyleXml(sStyleId: string) {
    return this.oHttp.get(this.APIURL + '/styles/getxml?styleId=' + sStyleId, { responseType: "text" });
  }

  // Update style xml
  postStyleXml(sStyleId: string, sStyleXml: any) {
    return this.oHttp.post<any>(this.APIURL + '/styles/updatexml?styleId=' + sStyleId, sStyleXml, {});
  }
}
