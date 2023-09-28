import { Injectable } from '@angular/core';
import { ConstantsService } from './services/constants.service';
import { OpenSearchService } from './services/api/open-search.service';
import { HttpClient } from '@angular/common/http';
import FadeoutUtils from './lib/utils/FadeoutJSUtils';
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

  m_oCollectionAllProductsModel: { list: any } = { list: [] }
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

  setProviders(asProvidersInput: any) {
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

  createSearchRequest(oFilter: any, iOffset: any, iLimit: any, sProviders?: any) {
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
    let filter = '';
    filter = this.createSearchFilter(textQuery, geoselection, advancedFilter, missionFilter);
    let saveSearchUrl = 'api/stub/users/0/searches?complete=:complete';
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
    //     // url: OpenSearchService.getApiProducts(this.createSearchRequest(filter, this.offset, this.limit)),
    //     url: OpenSearchService.getApiProductsWithProviders(this.createSearchRequest(filter, this.offset, this.limit,this.providers)),
    //     method: "GET"
    // });
    return this.m_oHttp.get<any>(this.m_oOpenSearchService.getApiProductsWithProviders(this.createSearchRequest(filter, this.m_iOffset, this.m_iLimit, this.m_aProviders[0].name)))
  }

  searchList(asTimeQueries: Array<string>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asTimeQueries)) asTimeQueries = [];

    // Array of filters to pass to the server
    let asFilters = [];

    // If there aren't advanced periods
    if (asTimeQueries.length == 0) {
      // Use standard dates
      let filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection,
        this.m_sAdvancedFilter, this.m_sMissionFilter);
      asFilters.push(filter);
    }
    else {
      // Put all the time filters in the array
      for (let iPeriods = 0; iPeriods < asTimeQueries.length; iPeriods++) {
        let filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection, asTimeQueries[iPeriods], this.m_sMissionFilter);
        asFilters.push(filter);
      }
    }
    let asProviderNames = this.m_aProviders.map(oProvider => {return oProvider.name})
    console.log(asProviderNames)

    // Call the API with the list of queries
    return this.m_oHttp.post(this.m_oOpenSearchService.getApiProductsListWithProviders(asProviderNames), asFilters);
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

  getProductsListCount(asTimeQueries) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asTimeQueries)) asTimeQueries = [];
    // Array of filters to pass to the server
    let asFilters = [];

    // If there aren't advanced periods
    if (asTimeQueries.length == 0) {
      // Use standard dates
      let filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection, this.m_sAdvancedFilter, this.m_sMissionFilter);
      asFilters.push(filter);
    }
    else {
      // Put all the time filters in the array
      for (let iPeriods = 0; iPeriods < asTimeQueries.length; iPeriods++) {
        let filter = this.createSearchFilter(this.m_sTextQuery, this.m_sGeoselection, asTimeQueries[iPeriods], this.m_sMissionFilter);
        asFilters.push(filter);
      }
    }

    let asProviderNames = this.m_aProviders.map(oProvider => {return oProvider.name})
    console.log(asProviderNames)
    return this.m_oHttp.post(this.m_oOpenSearchService.getApiProductListCountWithProviders(asProviderNames), asFilters);
  }

  goToPage(iPageNumber: number) {
    this.setOffset((iPageNumber * this.m_iLimit) - this.m_iLimit);
    return this.search();
  }

  getSuggestions(query) {
    let suggesturl = 'api/search/suggest/' + query;
    return this.m_oHttp.get(this.m_oConstantsService.getURL() + suggesturl, { observe: 'response' }).subscribe({
      next: oResponse => {
        if (oResponse.status === 200) {
          return oResponse.body
        } else; {
          return [];
        }
      }
    });
  }
  getCollectionProductsList(query, offset, limit) {
    return this.getProductsCount(query).subscribe({
      next: oResponse => { },
      error: oError => { }
    });
  }
  getAllCollectionProducts(query, offset, limit) {
    //console.log('called search function');
    return this.m_oHttp.get(this.m_oConstantsService.getAPIURL() + this.createSearchRequest(query, offset, limit)).subscribe({
      next: oResponse => {
        this.m_oCollectionAllProductsModel.list = oResponse;
      }
    });
  }

}