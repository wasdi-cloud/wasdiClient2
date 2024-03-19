import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { TranslateService } from '@ngx-translate/core';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { LightSearchService } from 'src/app/services/search/light-search.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { OpenSearchService } from 'src/app/services/api/open-search.service';

@Component({
  selector: 'app-wap-search-eo-image',
  templateUrl: './wap-search-eo-image.component.html',
  styleUrls: ['./wap-search-eo-image.component.css']
})
export class WapSearchEoImageComponent {
  @Input() m_oControlInput;
  @Output() m_oControlInputChange: EventEmitter<any> = new EventEmitter<any>();
  m_sMapId: string = `${Date.now() + Math.random()}`;

  m_bAreVisibleProducts: boolean = false;

  m_bLoadingData: boolean = false;

  m_aoMissions: Array<any> = [];  

  m_aListOfProviders: Array<any> = [];

  m_oSelectedProvider: any;


  constructor(
    private m_oConfigurationService: ConfigurationService,
    private m_oLightSearchService: LightSearchService,
    public m_oMapService: MapService,
    private m_oOpenSearchService: OpenSearchService,
    private m_oTranslateService: TranslateService) { }

  ngOnInit(): void {
    this.getListOfProviders();
    this.loadConfiguration();
    this.initMissionsFilters();
  }

  /**
   * Load the list of possible providers from the server: 
   */
  getListOfProviders() {
    this.m_oOpenSearchService.getListOfProvider().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          var iLengthData = oResponse.length;
          for (var iIndexProvider = 0; iIndexProvider < iLengthData; iIndexProvider++) {
            this.m_aListOfProviders[iIndexProvider] = {
              "name": oResponse[iIndexProvider].code,
              "totalOfProducts": 0,
              "totalPages": 1,
              "currentPage": 1,
              "productsPerPageSelected": 10,
              "selected": true,
              "isLoaded": false,
              "description": oResponse[iIndexProvider].description,
              "link": oResponse[iIndexProvider].link
            };
          }
        }
      },
      error: oError => { }
    })
  }

  /**
   * Load the configuration file and set the missions
   */
  loadConfiguration(): void {
    if (this.m_oConfigurationService.getConfiguration() != null) {
      this.m_aoMissions = this.m_oConfigurationService.getConfiguration().missions;
    }
  };

  /**
   * Handle Date Input from App-Input-Fields 
   * @param oEvent 
   */
  getDateInput(oEvent) {
    if (oEvent.label === 'From') {
      this.m_oControlInput.oStartDate = new Date(oEvent.event.target.value);
    } else {
      this.m_oControlInput.oEndDate = new Date(oEvent.event.target.value);
    }
  }

  /**
   * Format the Open Search Date
   * @returns string
   */
  getOpenSearchDate(): string {
    let oStartDate = this.m_oLightSearchService.utcDateConverter(this.m_oControlInput.oStartDate.m_sDate);
    let oEndDate = this.m_oLightSearchService.utcDateConverter(this.m_oControlInput.oEndDate.m_sDate);
    let oDates = {
      sensingPeriodFrom: oStartDate,
      sensingPeriodTo: oEndDate,
      ingestionFrom: null,
      ingestionTo: null
    };
    return this.m_oLightSearchService.getOpenSearchDate(oDates);
  };

  /**
   * Get more products on button click
   */
  loadMore(): void {
    let oThat = this;
    this.m_oSelectedProvider.currentPage = this.m_oSelectedProvider.currentPage + 1;
    let oCallback = function (result) {
      var sResults = result;
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sResults)) {

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(sResults.data) && sResults.data != "") {
          var aoData = sResults.data;
          this.m_oLightSearchService.setDefaultPreviews(aoData);
          oThat.m_oControlInput.oTableOfProducts.aoProducts = oThat.m_oControlInput.oTableOfProducts.aoProducts.concat(aoData);

        } else {
          // utilsVexDialogAlertTop("There are no other products");
        }
      }
      oThat.m_bLoadingData = false;
    };
    this.search(oCallback);
  };

  /**
   * Execute Search Handler
   */
  lightSearch() {
    this.m_bAreVisibleProducts = true;
    let oController = this;
    // clean table
    // this.m_oControlInput.oTableOfProducts.aoProducts = [];

    let oCallback = function (oResponse) {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
        let aoData = oResponse;
        // oController.m_oLightSearchService.setDefaultPreviews(aoData);
        oController.m_oControlInput.oTableOfProducts.aoProducts = aoData;
      }
      oController.m_bLoadingData = false;
    };

    this.search(oCallback);
  };

  search = function (oCallback) {
    //set geoselection

    let sOpenSearchGeoselection = this.m_oLightSearchService.getOpenSearchGeoselection(this.m_oControlInput.oSelectArea.oBoundingBox);

    let oOpenSearchDates = this.getOpenSearchDate();
    this.initSelectedProvider();
    let oProvider = this.m_oSelectedProvider;
    let oCallbackError = function () {
      // utilsVexDialogAlertTop("It was impossible loading product");
    };
    // this.initMissionsFilters();
    // this.m_aoMissions[1].selected = true;//TODO REMOVE LEGACY CODE
    let aoOpenSearchMissions = this.m_oLightSearchService.getOpenSearchMissions(this.m_aoMissions);

    this.m_bLoadingData = true;

    this.m_oLightSearchService.lightSearch(sOpenSearchGeoselection, oOpenSearchDates, oProvider, aoOpenSearchMissions,
      oCallback, oCallbackError);
  };


  // initSelectedProvider It's a kid of adapter
  initSelectedProvider() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aListOfProviders)) {
      return null;
    }
    let iNumberOfProviders = this.m_aListOfProviders.length;
    let oController = this;
    for (let iIndexProviders = 0; iIndexProviders < iNumberOfProviders; iIndexProviders++) {
      let iNumberOfInputSelectedProviders = this.m_oControlInput.aoProviders.length;
      for (let iIndexInputSelectedProvider = 0; iIndexInputSelectedProvider < iNumberOfInputSelectedProviders; iIndexInputSelectedProvider++) {
        if (this.m_aListOfProviders[iIndexProviders].name.toLowerCase() ===
          this.m_oControlInput.aoProviders[iIndexInputSelectedProvider].toLowerCase()) {

          oController.m_oSelectedProvider = this.m_aListOfProviders[iIndexProviders];
          break;
        }
      }

    }
  };

  // initMissionsFilters It's a kid of adapter
  initMissionsFilters() {
    let oController = this;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoMissions)) {
      return null;
    }
    let iNumberOfMissions = this.m_aoMissions.length;
    // let iNumberOfInputSelectedMissions = oController.m_oControlInput.aoMissionsFilters.length;

    // for (let iIndexMission = 0; iIndexMission < iNumberOfMissions; iIndexMission++) {
    //   for (let iIndexInputMission = 0; iIndexInputMission < iNumberOfInputSelectedMissions; iIndexInputMission++) {
    //     if (this.m_aoMissions[iIndexMission].indexvalue.toLowerCase() ===
    //       this.m_oControlInput.aoMissionsFilters[iIndexInputMission].name.toLowerCase()) {
    //       this.m_aoMissions[iIndexMission].selected = true;
    //     }
    //   }
    // }
  };

  selectedProducts = function () {
    //this.lightSearchObject.oTableOfProducts.oSingleSelectionLayer;
    //this.lightSearchObject.oTableOfProducts.aoProducts;
    this.backToLightSearch();
  }
}