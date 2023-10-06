import { Injectable } from '@angular/core';
import { OpenSearchService } from './api/open-search.service';

@Injectable({
  providedIn: 'root'
})
export class ResultOfSearchService {
  m_sTextQuery = "";
  m_oGeoSelection: any = '';
  m_iCurrentPage: number = 1;
  m_iProductsPerPageSelected = 10;
  m_aoProductList: Array<any> = [];
  m_iTotalPages: number = 1;
  m_iTotalOfProducts = 0;
  m_bIsVisibleListOfProducts: boolean = false;
  m_oActiveWorkspace: any = null;
  m_aoMissions: Array<any> = [];
  m_oSensingPeriodFrom: any = '';
  m_oSensingPeriodTo: any = '';
  m_oIngestionPeriodFrom: any = '';
  m_oIngestionPeriodTo: any = '';

  constructor(
    private m_oOpenSearchService: OpenSearchService,
  ) { }

  /************************ Set methods ***************************/
  /**
   * Reset Default Value
   */
  setDefaults() {
    this.m_sTextQuery = "";
    this.m_oGeoSelection = '';
    this.m_iCurrentPage = 1;
    this.m_iProductsPerPageSelected = 10;
    this.m_aoProductList = [];
    this.m_iTotalPages = 1;
    this.m_iTotalOfProducts = 0;
    this.m_bIsVisibleListOfProducts = false;
    this.m_oActiveWorkspace = null;
    this.m_aoMissions = [];
    this.m_oSensingPeriodFrom = '';
    this.m_oSensingPeriodTo = '';
    this.m_oIngestionPeriodFrom = '';
    this.m_oIngestionPeriodTo = '';
  }
  setIngestionPeriodTo(oIngestionPeriodTo) {
    this.m_oIngestionPeriodTo = oIngestionPeriodTo;
    return true;
  };

  setIngestionPeriodFrom(oIngestionPeriodFrom) {
    this.m_oIngestionPeriodFrom = oIngestionPeriodFrom;
    return true;
  };

  /**
   * Set value of sensing period TO
   * @param oDate 
   */
  setSensingPeriodTo(oDate: Date) {
    this.m_oSensingPeriodTo = oDate;
  }

  /**
   * Set value of sensing Period FROM
   * @param oDate 
   */
  setSensingPeriodFrom(oDate: Date) {
    this.m_oSensingPeriodFrom = oDate;
  }

  setTextQuery(sTextQuery) {
    //if(utilsIsStrNullOrEmpty(sTextQuery))
    //    return false //TODO throw error
    this.m_sTextQuery = sTextQuery;
    return true;
  };

  setGeoSelection(oGeoSelection) {
    //if(utilsIsStrNullOrEmpty(oGeoSelection))
    //    return false //TODO throw error
    this.m_oGeoSelection = oGeoSelection;
    return true;
  };

  setCurrentPage(iCurrentPage) {
    //if(utilsIsObjectNullOrUndefined(iCurrentPage))
    //    return false //TODO throw error
    this.m_iCurrentPage = iCurrentPage;
    return true;
  };

  setProductsPerPageSelected(iProductsPerPageSelected) {
    //if(utilsIsObjectNullOrUndefined(iProductsPerPageSelected))
    //    return false //TODO throw error
    this.m_iProductsPerPageSelected = iProductsPerPageSelected;
    return true;
  };

  setProductList(aoProductList) {
    //if(utilsIsObjectNullOrUndefined(aoProductList))
    //    return false //TODO throw error
    this.m_aoProductList = aoProductList;
    return true;
  };

  setTotalPages(iTotalPages) {
    //if(utilsIsObjectNullOrUndefined(iTotalPages))
    //    return false //TODO throw error
    this.m_iTotalPages = iTotalPages;
    return true;
  };

  setIsVisibleListOfProducts(bIsVisibleListOfProducts) {
    //if(utilsIsObjectNullOrUndefined(bIsVisibleListOfProducts))
    //    return false;//TODO throw error
    this.m_bIsVisibleListOfProducts = bIsVisibleListOfProducts;
    return true;
  };
  setTotalOfProducts(iTotalOfProducts) {
    //if(utilsIsObjectNullOrUndefined(iTotalOfProducts))
    //    return false;//TODO throw error
    this.m_iTotalOfProducts = iTotalOfProducts;
    return true;
  };

  setActiveWorkspace(oActiveWorkspace) {
    //if(utilsIsObjectNullOrUndefined(oActiveWorkspace))
    //    return false;//TODO throw error
    this.m_oActiveWorkspace = oActiveWorkspace;
    return true;
  };

  setMissions(aoMissions) {
    //if(utilsIsObjectNullOrUndefined(aoMissions))
    //    return false;
    this.m_aoMissions = aoMissions;
    return true;
  };

  /************************ Get methods ***************************/

  getSensingPeriodTo(): Date {
    return this.m_oSensingPeriodTo;
  }

  getSensingPeriodFrom(): Date {
    return this.m_oSensingPeriodFrom;
  }
}
