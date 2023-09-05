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
        this.m_aoMissions  = [];
        this.m_oSensingPeriodFrom = '';
        this.m_oSensingPeriodTo='';
        this.m_oIngestionPeriodFrom = '';
        this.m_oIngestionPeriodTo = '';
   }
}
