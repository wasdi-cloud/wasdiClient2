import { Component } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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

  // Model used to retrieve elements for search:
  m_oSearchModel = {
    textQuery:'',
    list: '',
    geoselection: '',
    offset: 0,
    pagesize: 25,
    advancedFilter: '',
    missionFilter: '',
    doneRequest: '',
    sensingPeriodFrom: '',
    sensingPeriodTo:'' ,
    ingestionFrom: '',
    ingestionTo: ''
  }
  m_bClearFiltersEnabled: boolean;
  m_bIsVisibleListOfLayers: boolean;
  m_bIsPaginatedList: boolean;
  m_bIsVisibleLocalStorageInputs: boolean;

  m_asListOfProviders: Array<any> = []

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
    private m_oAuthService: AuthService,
    private m_oConfigurationService: ConfigurationService,
    private m_oConstantsService: ConstantsService,
    private m_oFileBufferService: FileBufferService,
    private m_oMapService: MapService,
    private m_oPageService: PagesService,
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oSearchService: SearchService
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
   * Execute search on all selected providers - 
   */
  searchAllSelectedProviders() {
    //Check if there is at least one provider or layers are already visible - if there is no provider or there are already layers, do not search
    if (this.thereIsAtLeastOneProvider() === false || this.m_bIsVisibleListOfLayers || this.m_bIsVisibleLocalStorageInputs) {
      return false;
    }

    let iNumberOfProviders = this.m_asListOfProviders.length;

    // If there are providers, iterate over selected providers and for each one, execute the search and count results
    for (let iProviderIndex = 0; iProviderIndex < iNumberOfProviders; iProviderIndex++) {
      this.searchAndCount(this.m_asListOfProviders[iNumberOfProviders]);
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

    let oProviderObject = this.m_oPageService.getProviderObject(oProvider.name);
    let iOffset = this.m_oPageService.calcOffset(oProvider.name);
    this.m_oSearchService.setOffset(iOffset);//default 0 (index page)
    this.m_oSearchService.setLimit(oProvider.productsPerPageSelected);// default 10 (total of element per page)
    oProvider.isLoaded = false;
    oProvider.totalOfProthis

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

    if (this.m_oModel.textQuery.endsWith('*')) {
      this.m_oSearchService.setTextQuery("*" + this.m_oModel.textQuery + "*");
    }
    this.m_oSearchService.setTextQuery(this.m_oModel.textQuery);
    this.m_oSearchService.setGeoselection(this.m_oModel.geoselection);
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
    })

    // this.m_oSearchService.getProductsCount().subscribe(
    //   function (result) {
    //     if (result) {
    //       if (FadeoutUtils.utilsIsObjectNullOrUndefined(result.data) === false) {
    //         oProvider.totalOfProducts = result.data;
    //         //calc number of pages
    //         var remainder = oProvider.totalOfProducts % oProvider.productsPerPageSelected;
    //         oProvider.totalPages = Math.floor(oProvider.totalOfProducts / oProvider.productsPerPageSelected);
    //         if (remainder !== 0) oProvider.totalPages += 1;
    //       }
    //     }
    //   }, function errorCallback(response) {
    //     console.log("Impossible get products number");
    //   });

    // this.m_oSearchService.search().then(function (result) {
    //   var sResults = result;

    //   if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sResults)) {
    //     if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sResults.data) && sResults.data != "") {
    //       var aoData = sResults.data;
    //       this.generateLayersList(aoData);
    //     }

    //     oProvider.isLoaded = true;
    //   }
    // }, function errorCallback(response) {
    //   //utilsVexDialogAlertTop("GURU MEDITATION<br>ERROR IN OPEN SEARCH REQUEST");
    //   oProvider.isLoaded = true;
    //   // this.m_bIsVisibleListOfLayers = false;//visualize filter list
    //   // this.m_oResultsOfSearchService.setIsVisibleListOfProducts(this.m_bIsVisibleListOfLayers );
    // });

    return true;
  }

  openAddToWorkspaceDialog() {

  }

  thereIsAtLeastOneProvider() {
    return true;
  }

  deleteProducts(sProviderName) { }

  getMapInput(oEvent: string) {
    // Ensure oEvent is defined and if defined, set the geoselection string to the recieved Event Emitter
    if (oEvent) {
      this.m_oSearchModel.geoselection = oEvent;
    }

    console.log(this.m_oSearchModel);
  }
}
