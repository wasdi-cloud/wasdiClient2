import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConstantsService } from '../constants.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  downloadByName(sFileName: string, sWorkspace: string, sUrl: string) {
    let urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "filename=" + sFileName + "&workspace=" + sWorkspace;

    let sAPIUrl = this.APIURL;

    if (typeof sUrl !== "undefined") {
      if (sUrl !== null) {
        if (sUrl !== "") {
          sAPIUrl = sUrl;
        }
      }
    }

    window.location.href = sAPIUrl + "/catalog/downloadbyname" + urlParams;
  };

  newDownloadByName(sFileName: string, sWorkspace: string, sUrl: string): Observable<HttpEvent<any>> {
    var urlParams = "?" + "token=" + this.m_oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "filename=" + sFileName + "&workspace=" + sWorkspace;

    var sAPIUrl = this.APIURL;

    if (typeof sUrl !== "undefined") {
      if (sUrl !== null) {
        if (sUrl !== "") {
          sAPIUrl = sUrl;
        }
      }
    }

    return this.oHttp.get(sAPIUrl + "/catalog/downloadbyname" + urlParams, { responseType: 'blob', reportProgress: true, observe: "events" });
  };

  getProductProperties(sFileName: string, sWorkspace: string) {
    var sUrlParams = "?" + "file=" + sFileName + "&workspace=" + sWorkspace + "&getchecksum=false"

    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl)) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get<any>(sUrl + "/catalog/properties" + sUrlParams);
  };

  ingestFile(sSelectedFile: string, sWorkspace: string) {
    return this.oHttp.put(this.APIURL + '/catalog/upload/ingest?file=' + sSelectedFile + '&workspace=' + sWorkspace, {});
  };

  uploadFTPFile(oFtpTransferFile: object, sWorkspaceId: string) {
    return this.oHttp.put<any>(this.APIURL + '/catalog/upload/ftp?workspace=' + sWorkspaceId, oFtpTransferFile);
  };
}
