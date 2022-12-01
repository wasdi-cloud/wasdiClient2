import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class OpenSearchService {
  APIURL: string = this.oConstantsService.getAPIURL();

  //----------API------------------------
  API_GET_PROVIDERS: string = "/search/providers";
  API_GET_SEARCH: string = "/search/query?query=";
  API_GET_SEARCHLIST: string = "/search/querylist?";

  //-------------------------------------
  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  getApiProductsWithProviders(sQuery: string) {
    return this.APIURL + this.API_GET_SEARCH + encodeURI(sQuery);
  };

  getApiProductsListWithProviders(sProvidersInput: string) {
    return this.APIURL + this.API_GET_SEARCHLIST + "providers=" + sProvidersInput;
  };

  getApiProductCountWithProviders(sQueryInput: string, sProvidersInput: string) {
    return this.APIURL + '/search/query/count?query=' + encodeURI(sQueryInput) + "&providers=" + encodeURI(sProvidersInput);
  };

  getApiProductListCountWithProviders(sProvidersInput: string) {
    return this.APIURL + '/search/query/countlist?providers=' + encodeURI(sProvidersInput);
  };

  getListOfProvider() {
    return this.oHttp.get(this.APIURL + this.API_GET_PROVIDERS);
  }
}
