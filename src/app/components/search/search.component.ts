import { Component, OnInit, OnDestroy } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { SearchService } from 'src/app/search.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { MapService } from 'src/app/services/map.service';
import { PagesService } from 'src/app/services/pages.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Subject } from 'rxjs'
import { AdvancedSearchService } from 'src/app/services/search/advanced-search.service';
import { ResultOfSearchService } from 'src/app/services/result-of-search.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspacesListDialogComponent } from './workspaces-list-dialog/workspaces-list-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  host: { 'class': 'flex-fill' }
})
export class SearchComponent implements OnInit, OnDestroy {
  //Font Awesome Imports:
  faPlus = faPlus;

  m_oConfiguration: any;
  m_aoMissions: Array<any> = [];

  m_bClearFiltersEnabled: boolean;
  m_bIsVisibleListOfLayers: boolean = false;
  m_bIsPaginatedList: boolean = true;
  m_bIsVisibleLocalStorageInputs: boolean;

  m_aoSelectedProviders: Array<any> = [];
  m_oSelectedProvidersSubject: Subject<any> = new Subject<any>();
  m_aoProvidersAfterCount: Array<any> = [];

  m_oActiveProvider: any = null;

  m_asListOfProviders: Array<any> = [];
  m_aoListOfProviders: Array<any> = [];

  m_aoProductsList: Array<any> = [];
  m_oProductSubject: Subject<any> = new Subject<any>();

  m_aoSelectedProducts: any = [];

  m_iActiveProvidersTab: number;

  m_oActiveWorkspace: any;

  // Filter for Basic Search:
  m_oSearchModel = {
    textQuery: '',
    list: '',
    geoselection: '',
    offset: 0,
    pagesize: 25,
    advancedFilter: '',
    missionFilter: '',
    doneRequest: '',
    sensingPeriodFrom: '',
    sensingPeriodTo: '',
    ingestionFrom: '',
    ingestionTo: ''
  }

  //Filter For CronTab Feature: 
  m_oAdvancedFilter = {
    filterActive: "Seasons",//Seasons,Range,Months
    savedData: [],
    selectedSeasonYears: [],
    selectedSeason: "",
    listOfYears: [],
    listOfMonths: [],
    // listOfDays:[],
    selectedYears: [],
    selectedDayFrom: "",
    selectedDayTo: "",
    selectedMonthFrom: "",
    selectedMonthTo: "",
    selectedYearsSearchForMonths: [],
    selectedMonthsSearchForMonths: []
  }

  m_sTypeOfFilterSelected: string = "Time period";

  constructor(
    private m_oAdvancedSearchService: AdvancedSearchService,
    private m_oConfigurationService: ConfigurationService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oPageService: PagesService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oResultsOfSearchService: ResultOfSearchService,
    private m_oSearchService: SearchService,
    private m_oTranslate: TranslateService,
  ) {
    if (this.m_oConfigurationService.getConfiguration()!=null) {
      this.m_aoMissions = this.m_oConfigurationService.getConfiguration().missions;
    }
  }

  ngOnInit(): void {
    FadeoutUtils.verboseLog("SearchComponent.ngOnInit")
    this.m_oPageService.setFunction(this.executeSearch, this);
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  }

  ngOnDestroy(): void {
    FadeoutUtils.verboseLog("SearchComponent.ngOnDestroy")
  }

  m_fUtcDateConverter(oDate) {
    var result = oDate;
    if (oDate != undefined) {
      let utcDate = oDate.toISOString() // parsed as 4:30 UTC
      result = utcDate;
    }
    return result;
  };

  /**
   * Execute search on all selected providers using BASIC filters
   */
  searchAllSelectedProviders() {
    //Check if there is at least one provider or layers are already visible - if there is no provider or there are already layers, do not search
    if (this.thereIsAtLeastOneProvider() === false || this.m_bIsVisibleListOfLayers || this.m_bIsVisibleLocalStorageInputs) {
      return false;
    }

    if (this.m_aoSelectedProviders.length > 0) {
      //Clear Providers After Count before executing Search and Count
      this.m_aoProvidersAfterCount = [];
      this.m_aoSelectedProviders.forEach(oProvider => {
        this.searchAndCount(oProvider);
      })
    }

    return true;
  }

  searchListAllSelectedProviders() {
    if ((this.m_bIsVisibleListOfLayers || this.m_bIsVisibleLocalStorageInputs)) return false;

    // Check input data
    if (this.thereIsAtLeastOneProvider() === false) {
      // var sError= this.m_oTranslate.instant("MSG_SEARCH_SELECT_PROVIDER");
      // utilsVexDialogAlertDefault(sError,null);
      console.log("error")
      return false;
    }

    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oSearchModel.geoselection)) {
      // var sError= this.m_oTranslate.instant("MSG_SEARCH_ERROR_BBOX");
      // utilsVexDialogAlertDefault(sError,null);
      console.log("error");
      return false;
    }

    let iNumberOfProviders = this.m_aoSelectedProviders.length;

    for (let iIndexProvider = 0; iIndexProvider < iNumberOfProviders; iIndexProvider++) {
      if (this.m_aoSelectedProviders[iIndexProvider].selected === true) {
        this.executeSearchList(this.m_aoSelectedProviders[iIndexProvider]);
      }
    }
    return true;
  }

  searchAndCount(oProvider) {
    //If there is no provider selected, return false
    if (this.thereIsAtLeastOneProvider() === false) {
      return false;
    }

    //If the given provider is not defined, return false
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return false;
    }

    this.m_bClearFiltersEnabled = false;

    //Clear any layers and relatives on the map: 
    this.deleteProducts(oProvider.name);

    //Hide any previous results: 
    this.m_bIsVisibleListOfLayers = true;
    this.m_bIsPaginatedList = true;

    if (this.m_oSearchModel.textQuery.endsWith('*')) {
      this.m_oSearchService.setTextQuery("*" + this.m_oSearchModel.textQuery + "*");
    }

    this.m_oSearchService.setTextQuery(this.m_oSearchModel.textQuery);
    this.m_oSearchService.setGeoselection(this.m_oSearchModel.geoselection);
    let aoProviders = [];
    aoProviders.push(oProvider);
    this.m_oSearchService.setProviders(aoProviders);

    var oProvider = this.m_oPageService.getProviderObject(oProvider.name);
    let iOffset = this.m_oPageService.calcOffset(oProvider.name);
    this.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    this.m_oSearchService.setLimit(oProvider.productsPerPageSelected);// default 10 (total of element per page)
    oProvider.isLoaded = false;
    oProvider.totalOfProductss = 0;

    this.m_oSearchService.getProductsCount().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          oProvider.totalOfProducts = oResponse;

          let remainder = oProvider.totalOfProducts % oProvider.productsPerPageSelected;

          oProvider.totalPages = Math.floor(oProvider.totalOfProducts / oProvider.productsPerPageSelected);

          if (remainder !== 0) {
            oProvider.totalPages += 1;
          }
          this.m_aoProvidersAfterCount.push(oProvider);
          this.emitSelectedProviders();
        }

      },
      error: oError => { }
    });

    this.m_oSearchService.search().subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse !== '') {
          this.generateLayersList(oResponse);
        }
        oProvider.isLoaded = true;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("GURU MEDITATION<br>ERROR IN OPEN SEARCH REQUEST");
        oProvider.isLoaded = false;
      }
    });

    return true;
  }

  executeSearch(oInputProvider, oInputController?) {
    let oController = this;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oInputController) === false) {
      oController = oInputController;
    }

    if (oController.thereIsAtLeastOneProvider() === false) {
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oInputProvider) === true) {
      return false;
    }

    oController.m_bClearFiltersEnabled = false;
    //delete layers and relatives rectangles in map
    oController.deleteProducts(oInputProvider.name);
    //hide previous results
    oController.m_bIsVisibleListOfLayers = true;
    oController.m_bIsPaginatedList = true;
    //TODO
    // "*" + oController.m_oModel.textQuery + "*" fix
    // oController.m_oSearchService.setTextQuery("*" + oController.m_oModel.textQuery + "*");
    oController.m_oSearchService.setTextQuery(oController.m_oSearchModel.textQuery);
    oController.m_oSearchService.setGeoselection(oController.m_oSearchModel.geoselection);
    let aoProviders = [];
    aoProviders.push(oInputProvider);
    oController.m_oSearchService.setProviders(aoProviders);

    let oProvider = oController.m_oPageService.getProviderObject(oInputProvider.name);
    let iOffset = oController.m_oPageService.calcOffset(oInputProvider.name);
    oController.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    oController.m_oSearchService.setLimit(oInputProvider.productsPerPageSelected);// default 10 (total of element per page)
    oInputProvider.isLoaded = false;

    let sMessage = oController.m_oTranslate.instant("MSG_SEARCH_ERROR");

    oController.m_oSearchService.search().subscribe({
      next: oResult => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResult)) {
          let aoData = oResult;
          oController.generateLayersList(aoData);
        }

        oProvider.isLoaded = true;
      },
      error: oError => {
        oController.m_oNotificationDisplayService.openAlertDialog(sMessage);
        oProvider.isLoaded = true;
      }
    })
    return true;
  }

  executeSearchList(oProvider, oThat?) {
    // Take reference to the controller
    var oController = this;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oThat) === false) {
      oController = oThat;
    }

    // Check input data
    if (oController.thereIsAtLeastOneProvider() === false || FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return false;
    }

    if (FadeoutUtils.utilsIsStrNullOrEmpty(oController.m_oSearchModel.geoselection)) {
      return false;
    }

    oController.m_bClearFiltersEnabled = false;
    //delete layers and relatives rectangles in map
    oController.deleteProducts(oProvider.name);
    //hide previous results
    oController.m_bIsVisibleListOfLayers = true;
    oController.m_bIsPaginatedList = false;
    oController.m_oSearchService.setTextQuery(oController.m_oSearchModel.textQuery);
    oController.m_oSearchService.setGeoselection(oController.m_oSearchModel.geoselection);
    var aoProviders = [];
    aoProviders.push(oProvider);
    oController.m_oSearchService.setProviders(aoProviders);

    // Pagination Info: should be refactored, not needed in the list version
    var oProvider = oController.m_oPageService.getProviderObject(oProvider.name);
    var iOffset = oController.m_oPageService.calcOffset(oProvider.name);
    oController.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    oController.m_oSearchService.setLimit(oProvider.productsPerPageSelected);// default 10 (total of element per page)
    oProvider.isLoaded = false;
    oProvider.totalOfProducts = 0;

    // Generation of different time filters
    var asTimePeriodsFilters = [];

    // For each saved period
    for (var iPeriods = 0; iPeriods < this.m_oAdvancedFilter.savedData.length; iPeriods++) {

      // Prepare input data for date conversion
      var oAdvancedSensingFrom = null;
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodFrom) && this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodFrom !== "") {
        oAdvancedSensingFrom = this.m_fUtcDateConverter(this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodFrom);
      }
      var oAdvancedSensingTo = null;
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodTo) && this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodTo !== "") {
        oAdvancedSensingTo = this.m_fUtcDateConverter(this.m_oAdvancedFilter.savedData[iPeriods].data.dateSensingPeriodTo);
      }
      var oAdvancedIngestionFrom = null;
      var oAdvancedIngestionTo = null;

      var advancedFilter = {
        sensingPeriodFrom: oAdvancedSensingFrom,
        sensingPeriodTo: oAdvancedSensingTo,
        ingestionFrom: oAdvancedIngestionFrom,
        ingestionTo: oAdvancedIngestionTo
      };

      // Get the time filter object
      var sTimeFilter = this.getAdvancedDateFilterQuery(advancedFilter);
      // Push it to the queries list
      asTimePeriodsFilters.push(sTimeFilter);
    }

    // Call the complete Get Product Count for all the queries of this provider
    oController.m_oSearchService.getProductsListCount(asTimePeriodsFilters).subscribe({
      next: oResponse => {
        if (oResponse) {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {

            oProvider.totalOfProducts = oResponse;
            //calc number of pages
            var remainder = oProvider.totalOfProducts % oProvider.productsPerPageSelected;
            oProvider.totalPages = Math.floor(oProvider.totalOfProducts / oProvider.productsPerPageSelected);
            if (remainder !== 0) oProvider.totalPages += 1;
            this.m_aoProvidersAfterCount.push(oProvider);
            this.emitSelectedProviders();
          }
        }
      },
      error: oError => {
        console.log("Impossible get products number");
      }
    })

    // var sMessage = oController.m_oTranslate.instant("MSG_SEARCH_ERROR");

    // // Call the complete Search for all the queries of this provider
    oController.m_oSearchService.searchList(asTimePeriodsFilters).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {

          var aoData = oResponse;
          oController.generateLayersList(aoData)//.feed;

          oProvider.isLoaded = true;
        }
      },
      error: oError => {
        console.log(oError);

        oController.m_bIsVisibleListOfLayers = false;//visualize filter list
        oController.m_oResultsOfSearchService.setIsVisibleListOfProducts(oController.m_bIsVisibleListOfLayers);
      }
    });

    return true;
  }

  thereIsAtLeastOneProvider() {
    if (this.m_aoSelectedProviders.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  getAdvancedDateFilterQuery(oAdvancedFilter: any) {
    var sFilter = '';

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter)) return sFilter;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.sensingPeriodFrom) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.sensingPeriodTo)) {
      sFilter += '( beginPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.sensingPeriodFrom) +
        ' TO ' + this.m_oAdvancedSearchService.formatToDate(oAdvancedFilter.sensingPeriodTo) + '] AND endPosition:[' +
        this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.sensingPeriodFrom) + ' TO ' + this.m_oAdvancedSearchService.formatDateTo(oAdvancedFilter.sensingPeriodTo) + '] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.sensingPeriodFrom)) {
      sFilter += '( beginPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.sensingPeriodFrom) +
        ' TO NOW] AND endPosition:[' + this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.sensingPeriodFrom) + ' TO NOW] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.sensingPeriodTo)) {
      sFilter += '( beginPosition:[ * TO ' + this.m_oAdvancedSearchService.formatDateTo(oAdvancedFilter.sensingPeriodTo) + '] AND endPosition:[* TO ' + this.m_oAdvancedSearchService.formatToDate(oAdvancedFilter.sensingPeriodTo) + ' ] )';
    }
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.ingestionFrom) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.ingestionTo)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[' + this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.ingestionFrom) +
        ' TO ' + this.m_oAdvancedSearchService.formatDateTo(oAdvancedFilter.ingestionTo) + ' ] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.ingestionFrom)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[' + this.m_oAdvancedSearchService.formatDateFrom(oAdvancedFilter.ingestionFrom) + ' TO NOW] )';
    }
    else if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oAdvancedFilter.ingestionTo)) {
      sFilter += ((sFilter) ? ' AND' : '') + '( ingestionDate:[ * TO ' + this.m_oAdvancedSearchService.formatDateTo(oAdvancedFilter.ingestionTo) + ' ] )';
    }

    return sFilter;
  }
  /**
   * Get the Layers List
   * @param aoData 
   * @returns 
   */
  generateLayersList(aoData: any) {
    //Ensure Input data is defined: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoData) === true) {
      return false;
    }

    let iDataLength: number = aoData.length;

    for (let iIndexData = 0; iIndexData < iDataLength; iIndexData++) {
      let oSummary = this.stringToObjectSummary(aoData[iIndexData].summary);//change summary string to array

      aoData[iIndexData].summary = oSummary;

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoData[iIndexData].preview) || FadeoutUtils.utilsIsStrNullOrEmpty(aoData[iIndexData].preview))
        aoData[iIndexData].preview = "";//default value ( set it if there isn't the image)

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoData[iIndexData].footprint) == false) {
        //get bounds
        var aoBounds = this.getPolygonToBounds(aoData[iIndexData].footprint);
        aoData[iIndexData].bounds = aoBounds;
        // aaoAllBounds.push(aoBounds);
      }

      aoData[iIndexData].rectangle = null;
      aoData[iIndexData].checked = false;

      this.m_aoProductsList.push(aoData[iIndexData]);
    }
    let iActive = this.m_iActiveProvidersTab;

    for (var i = 0; i < this.m_asListOfProviders.length; i++) {
      if (this.m_asListOfProviders[i].selected) break;

      if (i >= iActive) iActive++;
    }
    this.emitProducts();

    return true;
  }

  deleteProducts(sProviderName: string) {
    //check if layers list is empty
    if (!this.isEmptyProductsList()) {
      const oMap = this.m_oMapService.getMap();
      /* remove rectangle in map*/
      for (let oProduct of this.m_aoProductsList) {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.provider) && oProduct.provider === sProviderName) {
          let oRectangle = oProduct.rectangle;
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle)) {
            this.m_oMapService.removeLayerFromMap(oRectangle);
          }
        }
      }
      //delete layers list
      this.m_aoProductsList = [];
      return true;
    } else {
      return false;
    }
  }

  isEmptyProductsList() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProductsList)) return true;
    if (this.m_aoProductsList.length == 0) return true;

    return false;
  }

  /********** Event Listeners & Subject Emitters **********/

  /**
   * Listens for changes to the Search Map Component and sets the SearchModel
   * @param oEvent 
   */
  getMapInput(oEvent: string) {
    // Ensure oEvent is defined and if defined, set the geoselection string to the recieved Event Emitter
    if (oEvent) {
      this.m_oSearchModel.geoselection = oEvent;
    }
  }

  /**
   * Listens for changes to the Mission Filter in the Search Filters Component and sets the SearchModel 
   * @param oEvent 
   */
  getMissionFilter(oEvent: any) {
    //Ensure oEvent is Defined: 
    if (oEvent) {
      //Extract Passed Values from oEvent model to Search Model: 
      this.m_oSearchModel.textQuery = oEvent.textQuery;
      this.m_oSearchModel.missionFilter = oEvent.missionFilter;
      this.m_oSearchModel.sensingPeriodFrom = oEvent.sensingPeriodFrom;
      this.m_oSearchModel.sensingPeriodTo = oEvent.sensingPeriodTo;
    }

    if (this.m_sTypeOfFilterSelected === 'Time period') {
      this.searchAllSelectedProviders();
    }

    if (this.m_sTypeOfFilterSelected === 'Time series') {
      this.searchListAllSelectedProviders();
    }
  }

  /**
   * Listens for changes to the Selected Providers in the Search Filters Component and sets SelectedProviders
   * @param oEvent
   */
  getSelectedProviders(oEvent: any) {
    this.m_aoSelectedProviders = oEvent;
  }

  getActiveProvider(oEvent: any) {
    this.m_oActiveProvider = oEvent;
    this.emitProducts();
  }

  getTimeFilter(oEvent: any) {
    this.m_sTypeOfFilterSelected = oEvent;
  }

  getAdvancedFilterSelection(oEvent: any) {
    this.m_oAdvancedFilter.savedData = oEvent;
  }

  getSelectedProducts(oEvent: any) {
    this.m_aoSelectedProducts = oEvent;
  }

  getNavigationFilters(oEvent: boolean) {
    this.m_bClearFiltersEnabled = true;

    this.m_bIsVisibleListOfLayers = false;
    //set default pages
    this.m_oPageService.setDefaultPaginationValuesForProvider();

    this.m_oResultsOfSearchService.setIsVisibleListOfProducts(false);
  }

  /**
   * Emit Products List to Child Components listening for the Observable
   */
  emitProducts() {
    this.m_oProductSubject.next(this.m_aoProductsList);
  }

  /**
   * Emit Selected Providers list to Child Componenets listening for the Observable
   */
  emitSelectedProviders() {
    this.m_oSelectedProvidersSubject.next(this.m_aoProvidersAfterCount);
  }


  /********** Product Utilities **********/

  stringToObjectSummary(sObjectSummary) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sObjectSummary) === true) {
      return null;
    }

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sObjectSummary) === true) {
      return null;
    }

    //Split the Object Summary at commas: 
    let asSplit = sObjectSummary.split(",");

    let oNewSummary = { Date: "", Instrument: "", Mode: "", Satellite: "", Size: "" };
    let asSummary = ["Date", "Instrument", "Mode", "Satellite", "Size"];
    let iSplitLength = asSplit.length;
    let iSummaryLength = asSummary.length;

    /* it dosen't know if date,instrument,mode...are the first element,second element,... of aSplit array
       * we fix it with this code
       * */
    for (let iIndex = 0; iIndex < iSplitLength; iIndex++) {
      for (let jIndex = 0; jIndex < iSummaryLength; jIndex++) {
        if (FadeoutUtils.utilsStrContainsCaseInsensitive(asSplit[iIndex], asSummary[jIndex])) {
          let oData = asSplit[iIndex].replace(asSummary[jIndex] + ":", "");
          oData = oData.replace(" ", "");//remove spaces from data
          oNewSummary[asSummary[jIndex].replace(":", "")] = oData;
          break;
        }
      }
    }

    return oNewSummary;
  }

  /**
   * Convert Polygon to Boudns Format
   * @param sPolygon 
   */
  getPolygonToBounds(sPolygon: string) {

    sPolygon = sPolygon.replace("MULTIPOLYGON ", "");
    sPolygon = sPolygon.replace("MULTIPOLYGON", "");
    sPolygon = sPolygon.replace("POLYGON ", "");
    sPolygon = sPolygon.replace("POLYGON", "");
    sPolygon = sPolygon.replace("(((", "");
    sPolygon = sPolygon.replace(")))", "");
    sPolygon = sPolygon.replace("((", "");
    sPolygon = sPolygon.replace("))", "");
    sPolygon = sPolygon.replace(/, /g, ",");

    let aPolygonArray = sPolygon.split(",");
    let aasNewPolygon = [];
    for (let iIndexBounds = 0; iIndexBounds < aPolygonArray.length; iIndexBounds++) {
      let aBounds = aPolygonArray[iIndexBounds];
      let aNewBounds = aBounds.split(" ");

      var oLatLonArray = [];

      try {
        oLatLonArray[0] = JSON.parse(aNewBounds[1]); //Lat
        oLatLonArray[1] = JSON.parse(aNewBounds[0]); //Lon
      } catch (err) {
        console.log("Function polygonToBounds: Error in parse operation");
        return [];
      }

      aasNewPolygon.push(oLatLonArray);
    }
    return aasNewPolygon;

  }

  /********** OPEN DIALOG HANDLERS **********/
  openAddToWorkspaceDialog() {
    let aoListOfSelectedProducts = this.m_aoSelectedProducts;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoListOfSelectedProducts) === true) {
      return false;
    }

    let oDialogRef = this.m_oDialog.open(WorkspacesListDialogComponent, {
      height: "55vh",
      width: '60vw',
      data: {
        products: aoListOfSelectedProducts
      }
    })
    return true;
  }
}
