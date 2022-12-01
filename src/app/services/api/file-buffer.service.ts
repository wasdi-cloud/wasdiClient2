import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class FileBufferService {
  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  download(sUrl: string, sFileName: string, sWorkspaceId: string, sBounds: string, sProvider: string) {
    let iCut: number = 4;
    let sProtocol: string = 'http';

    if (sUrl.startsWith("https:")) {
      iCut = 5;
      sProtocol = 'https';
    }
    if (sUrl.startsWith("file")) {
      iCut = 4;
      sProtocol = 'file';
    }

    if (sBounds) {
      if (sBounds.length > 1000) {
        sBounds = ""
      }
    }

    var sTest = sUrl.substring(iCut, sUrl.length);
    var sEncodedUri = encodeURIComponent(sTest);
    sEncodedUri = sProtocol + sEncodedUri;

    return this.oHttp.get(this.APIURL + '/filebuffer/download?fileUrl=' + sEncodedUri + "&name=" + sFileName + "&workspace=" + sWorkspaceId + "&bbox=" + sBounds + '&provider=' + sProvider);
  }

  share(sOriginWorkspaceId: string, sDestinationWorkspaceId: string, sProductName: string) {
    return this.oHttp.get(this.APIURL + '/filebuffer/share?originWorkspaceId=' + sOriginWorkspaceId + "&destinationWorkspaceId=" + sDestinationWorkspaceId + "&productName=" + sProductName);
  }

  publishBand(sUrl: string, sWorkspaceId: string, sBand: string) {
    return this.oHttp.get(this.APIURL + '/filebuffer/publishband?fileUrl=' + encodeURIComponent(sUrl) + "&workspace=" + sWorkspaceId + '&band=' + sBand);
  }

  getStyles() {
    return this.oHttp.get(this.APIURL + '/filebuffer//styles');
  }
}
