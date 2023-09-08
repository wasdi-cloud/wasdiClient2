import { Injectable } from '@angular/core';
import { ConstantsService } from './services/constants.service';
import { OpenSearchService } from './services/api/open-search.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oOpenSearchService: OpenSearchService
  ) { }

  providers = ''
  textQuery = ''
  geoselection = ''
  advancedFilter = ''
  missionFilter = ''
  offset = 0
  limit = 25
  filterContext = {
    doneRequest: '',
    sensingPeriodFrom: '',
    sensingPeriodTo: '',
    ingestionFrom: '',
    ingestionTo: ''
  }
  collectionProductsModel = { list: [], count: 0 }
  collectionAllProductsModel = { list: [] }

  setAdvancedFilter(advancedFilter) {
    this.advancedFilter = advancedFilter;
  }

  setMissionFilter(missionFilter) {
    this.missionFilter = missionFilter; 
  }
}