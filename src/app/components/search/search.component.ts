import { Component } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { AdvancedFilterService } from 'src/app/services/search/advanced-filter.service';
import { SearchService } from 'src/app/search.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { MapService } from 'src/app/services/map.service';
import { PagesService } from 'src/app/services/pages.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Subject } from 'rxjs'
import { AdvancedSearchService } from 'src/app/services/search/advanced-search.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ResultOfSearchService } from 'src/app/services/result-of-search.service';
import { OpenSearchService } from 'src/app/services/api/open-search.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
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

  m_asListOfProviders: Array<any> = []

  m_aoProductsList: Array<any> = [];
  m_oProductSubject: Subject<any> = new Subject<any>();

  m_iActiveProvidersTab: number;

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

  m_sTypeOfFilterSelected: string;

  constructor(
    private m_oAdvancedFilterService: AdvancedFilterService,
    private m_oAdvancedSearchService: AdvancedSearchService,
    private m_oAlertDialogService: AlertDialogTopService,
    private m_oAuthService: AuthService,
    private m_oConfigurationService: ConfigurationService,
    private m_oConstantsService: ConstantsService,
    private m_oFileBufferService: FileBufferService,
    private m_oMapService: MapService,
    private m_oOpenSearchService: OpenSearchService,
    private m_oPageService: PagesService,
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oResultsOfSearchService: ResultOfSearchService,
    private m_oSearchService: SearchService,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) {
    this.m_oConfigurationService.loadConfiguration();
    this.m_aoMissions = this.m_oConfigurationService.getConfiguration().missions;
  }

  /**
   * Set the type of filter selected as "Time period"
   */
  setFilterTypeAsTimePeriod() {
    this.m_sTypeOfFilterSelected = "Time period";
  }
  /**
   * Set the type of filter selected as "Time series"
   */
  setFilterTypeAsTimeSeries() {
    this.m_sTypeOfFilterSelected = "Time series";
  }

  /**
   * Update the Type of filter selected as time period if no saved data 
   */
  updateAdvancedSavedFiltersUi() {
    if (this.m_oAdvancedFilter.savedData.length == 0) {
      this.setFilterTypeAsTimePeriod();
    }
  }

  /**
   * Execute search on all selected providers using BASIC filters
   */
  searchAllSelectedProviders() {
    //Check if there is at least one provider or layers are already visible - if there is no provider or there are already layers, do not search
    if (this.thereIsAtLeastOneProvider() === false || this.m_bIsVisibleListOfLayers || this.m_bIsVisibleLocalStorageInputs) {
      return false;
    }

    if (this.m_aoSelectedProviders.length > 0) {
      this.m_aoSelectedProviders.forEach(oProvider => {
        this.searchAndCount(oProvider);
      })
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
        this.m_oAlertDialogService.openDialog(4000, "GURU MEDITATION<br>ERROR IN OPEN SEARCH REQUEST");
        oProvider.isLoaded = false;
      }
    });

    return true;
  }

  executeSeach(oProvider) {

    if (this.thereIsAtLeastOneProvider() === false) {
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return false;
    }

    this.m_bClearFiltersEnabled = false;
    //delete layers and relatives rectangles in map
    this.deleteProducts(oProvider.name);
    //hide previous results
    this.m_bIsVisibleListOfLayers = true;
    this.m_bIsPaginatedList = true;

    if (this.m_oSearchModel.textQuery.endsWith('*')) {
      this.m_oSearchService.setTextQuery("*" + this.m_oSearchModel.textQuery + "*");
    }
    this.m_oSearchService.setTextQuery(this.m_oSearchModel.textQuery);
    this.m_oSearchService.setGeoselection(this.m_oSearchModel.geoselection);
    var aoProviders = [];
    aoProviders.push(oProvider);
    this.m_oSearchService.setProviders(aoProviders);

    var oProvider = this.m_oPageService.getProviderObject(oProvider.name);
    var iOffset = this.m_oPageService.calcOffset(oProvider.name);
    this.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    this.m_oSearchService.setLimit(oProvider.productsPerPageSelected);// default 10 (total of element per page)
    oProvider.isLoaded = false;
    oProvider.totalOfProducts = 0;

    this.m_oSearchService.getProductsCount().subscribe({
      next: oResponse => {
        console.log(oResponse);
      },
      error: oError => {
        console.log(oError);
      }
    });

    return true;
  }

  openAddToWorkspaceDialog() { }

  thereIsAtLeastOneProvider() {
    if (this.m_aoSelectedProviders.length > 0) {
      return true;
    } else {
      // return false;

      return true; //uncomment before commit
    }
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
        aoData[iIndexData].preview = "assets/icons/ImageNotFound.svg";//default value ( set it if there isn't the image)

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
    if (this.isEmptyProductsList()) return false;
    var iLengthProductsList = this.m_aoProductsList.length;
    var oMap = this.m_oMapService.getMap();
    /* remove rectangle in map*/
    for (var iIndexProductsList = 0; iIndexProductsList < iLengthProductsList; iIndexProductsList++) {
      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProductsList[iIndexProductsList].provider) === false) && (this.m_aoProductsList[iIndexProductsList].provider === sProviderName)) {
        var oRectangle = this.m_aoProductsList[iIndexProductsList].rectangle;
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle))
          oRectangle.removeFrom(oMap);
        if (iIndexProductsList > -1) {
          this.m_aoProductsList.splice(iIndexProductsList, 1);
          iLengthProductsList--;
          iIndexProductsList--;
        }
      }

    }
    //delete layers list
    this.m_aoProductsList = [];
    return true;
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

}
