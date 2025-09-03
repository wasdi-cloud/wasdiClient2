import { Injectable } from '@angular/core';
import {ConstantsService} from "../constants.service";
import {HttpClient} from "@angular/common/http";
import FadeoutUtils from "../../lib/utils/FadeoutJSUtils";

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}
  /**
   * Get the link to an attachment file
   * @param sFileName
   * @param sWorkSpaceId
   * @param sName
   * @returns
   */
  getAttachmentLink(sFileName: string, sWorkSpaceId: string) {
    let sUrl = this.APIURL + '/catalog/downloadbyname?fileName=' + sFileName + '&worskpaceId=' + sWorkSpaceId ;
    if (this.m_oConstantsService != null) {
      let sSessionId = this.m_oConstantsService.getSessionId();
      let sTokenParam = "&token=" + sSessionId;
      if (!sUrl.includes(sTokenParam)) {
        sUrl = sUrl + sTokenParam;
      }
    }
    return sUrl;
  }

  /**
   * Get an attachment file
   * @param sCollection
   * @param sFolder
   * @param sName
   * @param sToken
   * @returns
   */
  get(sCollection: string, sFolder: string, sName: string, sToken: string) {
    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);

    if (sToken) {
      sUrlParams += '&token=' + sToken;
    }

    return this.m_oHttp.get(this.APIURL + '/attachment/get' + sUrlParams, { responseType: "blob"});
  }

}
