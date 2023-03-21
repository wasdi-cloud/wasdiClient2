import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { oConfirmation } from './workspace.service';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  //REFACTOR oOptions: 
  // m_oOptions = {
  //   transformRequest: angular.identity,
  //   headers: { 'Content-Type': undefined }
  // };

  // Upload a style by file
  uploadFile(sName: string, sDescription: string, oBody: object, bIsPublic: boolean) {
    // return this.oHttp.post(this.APIURL + '/styles/uploadfile?' + "name=" + sName +
    //     "&description=" + sDescription + "&public=" + bIsPublic, oBody, this.m_oOptions);
  };

  // Update style xml file
  updateStyleFile(sStyleId: string, oBody: object) {
    // return this.oHttp.post(this.APIURL + '/styles/updatefile?styleId=' + sStyleId, oBody, this.m_oOptions);
  }

  // Update style parameters
  updateStyleParameters(sStyleId: string, sDescription: string, bIsPublic: boolean) {
    // return this.oHttp.post(this.APIURL + '/styles/updateparams?styleId=' + sStyleId +
    //   '&description=' + sDescription +'&public=' + bIsPublic);
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

    //This will not work in TypeScript
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
  addStyleSharing(sStyleId: string, sUserId: string) {
    //Requires an argument for the body
    return this.oHttp.put<oConfirmation>(this.APIURL + '/styles/share/add?styleId=' + sStyleId + '&userId=' + sUserId, {});
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
  postStyleXml(sStyleId: string, sStyleXml: string) {
    // return this.oHttp.post(this.APIURL + '/styles/updatexml?styleId=' + sStyleId, sStyleXml, this.m_oOptions);
  }
}
