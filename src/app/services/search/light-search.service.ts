import { Injectable } from '@angular/core';
import { AdvancedSearchService } from './advanced-search.service';
import { AdvancedFilterService } from './advanced-filter.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { SearchService } from 'src/app/search.service';

@Injectable({
  providedIn: 'root'
})
export class LightSearchService {

  m_sDefaultProductImage = "";

  constructor(
    private m_oAdvancedSearchService: AdvancedSearchService,
    private m_oAdvancedFilterService: AdvancedFilterService,
    private m_oSearchService: SearchService
  ) { }


  getOpenSearchGeoselection(oBoundingBox) {
    var sFilter = '( footprint:"intersects(POLYGON((';


    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oBoundingBox)) {
      var oNorthEast = oBoundingBox.northEast;
      var oSouthWest = oBoundingBox.southWest;

      //  ----------X
      // |          |
      // |          |
      //  ----------
      sFilter = sFilter + oNorthEast.lng + " " + oNorthEast.lat + ",";
      //  ----------
      // |          |
      // |          |
      //  ----------X
      sFilter = sFilter + oSouthWest.lng + " " + oNorthEast.lat + ",";
      //  ----------
      // |          |
      // |          |
      // X----------
      sFilter = sFilter + oSouthWest.lng + " " + oSouthWest.lat + ",";
      // X----------
      // |          |
      // |          |
      //  ----------
      sFilter = sFilter + oNorthEast.lng + " " + oSouthWest.lat + ",";
      //  ----------X
      // |          |
      // |          |
      //  ----------
      sFilter = sFilter + oNorthEast.lng + " " + oNorthEast.lat + ')))" )';
    }

    return sFilter;
  };

  utcDateConverter(date) {
    var result = date;
    if (date != undefined) {
      // var day = moment(date).get('date');
      // var month = moment(date).get('month');
      // var year = moment(date).get('year');
      // var utcDate = moment(year + "-" + (parseInt(month) + 1) + "-" + day + " 00:00 +0000", "YYYY-MM-DD HH:mm Z"); // parsed as 4:30 UTC
      // result = utcDate;
    }

    return result;
  };

  getOpenSearchDate(searchFilter) {

    var sFilter = '';

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter)) return sFilter;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.sensingPeriodFrom) && !FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.sensingPeriodTo)) {
      sFilter += '( beginPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(searchFilter.sensingPeriodFrom) +
        ' TO ' + this.m_oAdvancedSearchService.formatToDate(searchFilter.sensingPeriodTo) + '] AND endPosition:[' +
        this.m_oAdvancedSearchService.formatDateFrom(searchFilter.sensingPeriodFrom) + ' TO ' + this.m_oAdvancedSearchService.formatDateTo(searchFilter.sensingPeriodTo) + '] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.sensingPeriodFrom)) {
      sFilter += '( beginPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(searchFilter.sensingPeriodFrom) +
        ' TO NOW] AND endPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(searchFilter.sensingPeriodFrom) + ' TO NOW] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.sensingPeriodTo)) {
      sFilter += '( beginPosition:[ * TO ' + this.m_oAdvancedSearchService.formatDateTo(searchFilter.sensingPeriodTo) + '] AND endPosition:[* TO ' + this.m_oAdvancedSearchService.formatToDate(searchFilter.sensingPeriodTo) + ' ] )';
    }
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.ingestionFrom) && !FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.ingestionTo)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[' + this.m_oAdvancedSearchService.formatDateFrom(searchFilter.ingestionFrom) +
        ' TO ' + this.m_oAdvancedSearchService.formatDateTo(searchFilter.ingestionTo) + ' ] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.ingestionFrom)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[' + this.m_oAdvancedSearchService.formatDateFrom(searchFilter.ingestionFrom) + ' TO NOW] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(searchFilter.ingestionTo)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[ * TO ' + this.m_oAdvancedSearchService.formatDateTo(searchFilter.ingestionTo) + ' ] )';
    }

    return sFilter;
  };

  setDefaultPreviews(aoProducts) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProducts) === true) {
      return false;
    }
    let iNumberOfProducts = aoProducts.length;
    for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProducts[iIndexProduct].preview) ||
        FadeoutUtils.utilsIsStrNullOrEmpty(aoProducts[iIndexProduct].preview)) {
        aoProducts[iIndexProduct].preview = this.m_sDefaultProductImage;
      }


    }
    return true;
  };


  calcOffset = function (oProvider) {

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true)
      return -1;

    return (oProvider.currentPage - 1) * oProvider.productsPerPageSelected;
  };

  getOpenSearchMissions = function (aoMissions) {
    this.m_oAdvancedFilterService.setAdvancedFilter(aoMissions);
    return this.m_oAdvancedFilterService.getAdvancedFilter();
  }

  lightSearch = function (sOpenSearchGeoselection, oOpenSearchDates, oProvider,
    aoOpenSearchMissions, oCallback, oCallbackError) {

    this.setSearchParameters(sOpenSearchGeoselection, oOpenSearchDates, oProvider,
      aoOpenSearchMissions);

    this.m_oSearchService.search().subscribe({
      next: oResponse => {
        oCallback(oResponse);
      },
      error: oError => {
        oCallbackError();
      }
    })
    
    
    
    // then(function (result) {
    //   oCallback(result);
    // }, function errorCallback(response) {
    //   oCallbackError();
    // });
  };

  setSearchParameters(sOpenSearchGeoselection, oOpenSearchDates, oProvider,
    aoOpenSearchMissions) {
    this.m_oSearchService.setGeoselection(sOpenSearchGeoselection);
    this.m_oSearchService.setAdvancedFilter(oOpenSearchDates);
    var aoProviders = [];
    aoProviders.push(oProvider);
    this.m_oSearchService.setProviders(aoProviders);
    var iOffset = this.calcOffset(oProvider);
    this.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    this.m_oSearchService.setLimit(oProvider.productsPerPageSelected);
    this.m_oSearchService.setMissionFilter(aoOpenSearchMissions);
  }
}
