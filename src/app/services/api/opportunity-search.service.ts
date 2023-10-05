import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class OpportunitySearchService {
  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  searchOrbit(oData: object) {
    return this.oHttp.post(this.APIURL + '/searchorbit/search', oData, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });

  };

  getKML(sText: string, sFootPrint: string) {
    return this.oHttp.get(this.APIURL + '/searchorbit/getkmlsearchresults?text=' + sText + "&footPrint=" + sFootPrint);
  }

  getSatellitesResources() {
    return this.oHttp.get<Array<any>>(this.APIURL + '/searchorbit/getsatellitesresource');
  }

  getTrackSatellite(sNameInput: string) {
    return this.oHttp.get<any>(this.APIURL + '/searchorbit/track/' + sNameInput);
  }

  getUpdatedTrackSatellite(sNameInput: string) {
    return this.oHttp.get<any>(this.APIURL + '/searchorbit/updatetrack/' + sNameInput);
  }

}
