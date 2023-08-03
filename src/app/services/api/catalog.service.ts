import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  downloadByName(sFileName: string, sWorkspace: string, sUrl: string) {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
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

  newDownloadByName(sFileName: string, sWorkspace: string, sUrl: string): Observable<Blob> {
    var urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "filename=" + sFileName + "&workspace=" + sWorkspace;

    var sAPIUrl = this.APIURL;

    if (typeof sUrl !== "undefined") {
      if (sUrl !== null) {
        if (sUrl !== "") {
          sAPIUrl = sUrl;
        }
      }
    }

    return this.oHttp.get(sAPIUrl + "/catalog/downloadbyname" + urlParams, { responseType: 'blob'});
  };

  ingestFile(sSelectedFile: string, sWorkspace: string) {
    return this.oHttp.put(this.APIURL + '/catalog/upload/ingest?file=' + sSelectedFile + '&workspace=' + sWorkspace, {});
  };

  uploadFTPFile(oFtpTransferFile: object, sWorkspaceId: string) {
    return this.oHttp.put(this.APIURL + '/catalog/upload/ftp?workspace=' + sWorkspaceId, oFtpTransferFile);
  };
}
