import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessorService {
  APIURL: string;

  constructor(private http: HttpClient, private oConstantsService: ConstantsService) {
    this.APIURL = oConstantsService.getAPIURL();
  }

  fetchMarketplaceList(oFilter: object) {
    return this.http.post<any>(this.APIURL + '/processors/getmarketlist', oFilter)
  }
}
