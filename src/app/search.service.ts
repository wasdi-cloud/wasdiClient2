import { Injectable } from '@angular/core';
import { ConstantsService } from './services/constants.service';
import { OpenSearchService } from './services/api/open-search.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient,
    private m_oOpenSearchService: OpenSearchService,
  ) { }

  m_sAdvancedFilter = ''

  m_sGeoselection = ''
  m_sMissionFilter = ''
  m_aProviders: any = ''
  m_sTextQuery = ''

  m_iLimit = 25
  m_iOffset = 0


  m_oCollectionAllProductsModel = { list: [] }
  m_oCollectionProductsModel = { list: [], count: 0 }
  m_oFilterContext = {
    doneRequest: '',
    sensingPeriodFrom: '',
    sensingPeriodTo: '',
    ingestionFrom: '',
    ingestionTo: ''
  }

  /****** SETTER METHODS ******/
  setAdvancedFilter(sAdvancedFilter: string) {
    this.m_sAdvancedFilter = sAdvancedFilter;
  }

  setGeoselection(sGeoselection) {
    this.m_sGeoselection = sGeoselection;
  }

  setLimit(iLimit) {
    this.m_iLimit = iLimit;
  }

  setMissionFilter(sMissionFilter: string) {
    this.m_sMissionFilter = sMissionFilter;
  }

  setOffset(iOffset: number) {
    this.m_iOffset = iOffset
  }

  setProviders(asProvidersInput:any) {
    this.m_aProviders = asProvidersInput;
  }

  setTextQuery(sTextQuery: string) {
    this.m_sTextQuery = sTextQuery;
  }

  getGeoQueryByCoordsOld(coords: Array<any>) {
    if (!coords) {
      return false;
    }
    let query: string = "(footprint:\"Intersects(POLYGON((";
    for (let i = 0; i < coords.length; i++) {
      query += coords[i].lon + " " + coords[i].lat + ((i != (coords.length - 1)) ? "," : "");
      query += ")))\")";
    }
    return query;
  }

  /****** CREATOR METHODS ******/

  createSearchRequest(oFilter: any, iOffset: any, iLimit: any, sProviders: any) {
    let searchUrl: string = ":filter&offset=:offset&limit=:limit&providers=:providers";

    searchUrl = searchUrl.replace(":filter", (oFilter) ? oFilter : '*');
    searchUrl = searchUrl.replace(":offset", (iOffset) ? iOffset : '0');
    searchUrl = searchUrl.replace(":limit", (iLimit) ? iLimit : '10');
    searchUrl = searchUrl.replace(":providers", (sProviders) ? sProviders : '');

    this.m_oFilterContext.doneRequest = oFilter;

    return searchUrl;
  }

  createSearchFilter(textQuery, geoselection, advancedFilter, missionFilter) {
    let searchFilter = '';
    if (textQuery) searchFilter += textQuery;
    if (geoselection) searchFilter += ((textQuery) ? ' AND ' : '') + this.getGeoQueryByCoords(geoselection);
    if (advancedFilter) searchFilter += ((textQuery || geoselection) ? ' AND ' : '') + advancedFilter;
    if (missionFilter) searchFilter += ((textQuery || geoselection || advancedFilter) ? ' AND ' : '') + missionFilter;
    return searchFilter;
  }

  saveUserSearch(textQuery, geoselection, advancedFilter, missionFilter) {
    var filter = '';
    filter = this.createSearchFilter(textQuery, geoselection, advancedFilter, missionFilter);
    var saveSearchUrl = 'api/stub/users/0/searches?complete=:complete';
    saveSearchUrl = saveSearchUrl.replace(":complete", (filter) ? filter : '*');
    // return http({url: ConstantsService.getUrl() + saveSearchUrl, method: "POST"})
    //     .then(function (response) {
    //         return (response.status == 200) ? response.data : [];
    //     });
  }



  getGeoQueryByCoords(query) {
    return query;
  }


  search(query?) {
    //console.log('called search function');
    let filter = '';
    if (query)
        filter = this.createSearchFilter(query, '', '', '');
    else
        filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection,
            this.m_sAdvancedFilter, this.m_sMissionFilter);
    //console.log('filter xx',filter);
    // return $http({
    //     // url: OpenSearchService.getApiProducts(self.createSearchRequest(filter, self.offset, self.limit)),
    //     url: OpenSearchService.getApiProductsWithProviders(self.createSearchRequest(filter, self.offset, self.limit,self.providers)),
    //     method: "GET"
    // });
    return this.m_oHttp.get<any>(this.m_oOpenSearchService.getApiProductsWithProviders(this.createSearchRequest(filter, this.m_iOffset, this.m_iLimit,this.m_aProviders[0].name)))
  }

  getProductsCount(query?) {
    let filter = '';

    if (query) {
      filter = this.createSearchFilter(query, '', '', '');
    } else {
      filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection, this.m_sAdvancedFilter, this.m_sMissionFilter);
    }

    console.log(this.m_aProviders[0].name);

    let prodCountUrl: string = ':filter';
    prodCountUrl = prodCountUrl.replace(":filter", (filter) ? filter : '*');

    return this.m_oHttp.get<any>(this.m_oOpenSearchService.getApiProductCountWithProviders(prodCountUrl, this.m_aProviders[0].name));
  }
}