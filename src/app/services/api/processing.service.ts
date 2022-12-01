import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessingService {
  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }
  
  //header field for post calls
  m_oOptions = {
    headers: { 'Content-Type': undefined }
  };

  geometricMosaic(sWorkspaceId: string, sDestinationProductName: string, oMosaic: object) {
    return this.oHttp.post(this.APIURL + '/processing/mosaic?workspace=' + sWorkspaceId + "&name=" + sDestinationProductName, oMosaic);
  }
}
