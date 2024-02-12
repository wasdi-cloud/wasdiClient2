import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

//Import Services:
import { AdvancedSearchService } from 'src/app/services/search/advanced-search.service';
import { MissionFiltersService } from 'src/app/services/mission-filters.service';
import { PagesService } from 'src/app/services/pages.service';
import { ResultOfSearchService } from 'src/app/services/result-of-search.service';
import { SearchService } from 'src/app/search.service';

//Angular Materials Imports: 
import { MatSelectChange } from '@angular/material/select';

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MatDialog } from '@angular/material/dialog';
import { AdvancedFiltersComponent } from '../advanced-filters/advanced-filters.component';
import { OpenSearchService } from 'src/app/services/api/open-search.service';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {

  @Input() m_aoMissions: Array<any> = [];
  @Input() m_aoSelectedProviders: Array<any> = [];
  @Output() m_oSearchFilter: EventEmitter<any> = new EventEmitter();
  @Output() m_aoProviderSelection: EventEmitter<any> = new EventEmitter();
  @Output() m_oTypeOfFilterSelected: EventEmitter<string> = new EventEmitter();
  @Output() m_oAdvancedFilterSelection: EventEmitter<any> = new EventEmitter();

  m_oMissionObject: any = {
    textQuery: '',
    list: '',
    offset: 0,
    pagesize: 25,
    advancedFilter: '',
    missionFilter: '',
    doneRequest: '',
    sensingPeriodFrom: '',
    sensingPeriodTo: '',
    ingestionFrom: '',
    ingestionTo: ''
  };

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

  m_oActiveMission: any = null;
  m_aoUserProviderSelection: Array<any> = [];

  m_aoListOfProviders: any = [];

  m_aoFilters: Array<any> = [];
  m_aoVisibleFilters: Array<any> = [];

  m_sDateTo: string = '';
  m_sDateFrom: string = '';
  m_sTypeOfFilterSelected: string = '';

  m_bUseCronTab: boolean = false;

  constructor(
    private m_oAdvancedSearchService: AdvancedSearchService,
    private m_oDialog: MatDialog,
    private m_oOpenSearchService: OpenSearchService,
    private m_oPagesService: PagesService,
    private m_oMissionFiltersService: MissionFiltersService,
    private m_oResultsOfSearchService: ResultOfSearchService,
    private m_oSearchService: SearchService
  ) { }

  ngOnInit(): void {
    this.setActiveMission(this.m_aoMissions[0]);
    this.setDefaultDateData();
    this.setDefaultSelectedProvider();
    this.setAdvancedSearchFilter();
    this.setFilterTypeAsTimePeriod();
  }

  /************ SET DEFAULT VALUE METHODS ************/

  /**
  * Set the type of filter selected as "Time period"
  */
  setFilterTypeAsTimePeriod() {
    this.m_sTypeOfFilterSelected = "Time period";
    this.m_oTypeOfFilterSelected.emit(this.m_sTypeOfFilterSelected);
    this.m_bUseCronTab = false;
  }
  /**
   * Set the type of filter selected as "Time series"
   */
  setFilterTypeAsTimeSeries() {
    this.m_sTypeOfFilterSelected = "Time series";
    this.m_oTypeOfFilterSelected.emit(this.m_sTypeOfFilterSelected);
    this.m_bUseCronTab = true;
  }

  /**
   * Set default date data
   */
  setDefaultDateData() {
    let oToDate = new Date();

    this.m_oResultsOfSearchService.setSensingPeriodTo(oToDate);

    let oFromDate = new Date();
    let oDayOfMonth = oFromDate.getDate();
    oFromDate.setDate(oDayOfMonth - 7);

    this.m_oResultsOfSearchService.setSensingPeriodFrom(oFromDate);

    this.m_oMissionObject.sensingPeriodFrom = this.m_oResultsOfSearchService.getSensingPeriodFrom();
    this.m_oMissionObject.sensingPeriodTo = this.m_oResultsOfSearchService.getSensingPeriodTo();

    this.m_sDateFrom = this.m_oResultsOfSearchService.getSensingPeriodFrom().toISOString().slice(0, 10);
    this.m_sDateTo = this.m_oResultsOfSearchService.getSensingPeriodTo().toISOString().slice(0, 10);
  }

  /**
   * Retrieves the list of providers as an Observable and sets value of List of Providers
   */
  setDefaultSelectedProvider() {
    // this.m_aoListOfProviders = this.m_oPagesService.getProviders();
    this.m_oOpenSearchService.getListOfProvider().subscribe({
      next: oResponse => {
        this.m_aoListOfProviders[0] = {
          "name": "AUTO",
          "totalOfProducts": 0,
          "totalPages": 1,
          "currentPage": 1,
          "productsPerPageSelected": 10,
          "selected": true,
          "isLoaded": false,
          "description": "WASDI Automatic Data Provider",
          "link": "https://www.wasdi.net"
        };

        let iLengthData = oResponse.length;
        for (let iIndexProvider = 0; iIndexProvider < iLengthData; iIndexProvider++) {
          this.m_aoListOfProviders[iIndexProvider + 1] = {
            "name": oResponse[iIndexProvider].code,
            "totalOfProducts": 0,
            "totalPages": 1,
            "currentPage": 1,
            "productsPerPageSelected": 10,
            "selected": false,
            "isLoaded": false,
            "description": oResponse[iIndexProvider].description,
            "link": oResponse[iIndexProvider].link
          };
        }
        this.m_aoUserProviderSelection[0] = this.m_aoListOfProviders[0];

        if (this.m_aoSelectedProviders.length > 0) {
          this.m_aoUserProviderSelection = this.m_aoSelectedProviders;
        }

        this.m_aoProviderSelection.emit(this.m_aoUserProviderSelection);
        return this.m_aoListOfProviders
      },
      error: oError => {
        console.log("Error getting providers");
      }
    })
  }


  setAdvancedSearchFilter() {
    let oAdvancedSensingFrom = null;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oMissionObject.sensingPeriodFrom) && this.m_oMissionObject.sensingPeriodFrom !== "") {
      oAdvancedSensingFrom = this.m_fUtcDateConverter(this.m_oMissionObject.sensingPeriodFrom);
    }
    let oAdvancedSensingTo = null;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oMissionObject.sensingPeriodTo) && this.m_oMissionObject.sensingPeriodTo !== "") {
      oAdvancedSensingTo = this.m_fUtcDateConverter(this.m_oMissionObject.sensingPeriodTo);
    }
    let oAdvancedIngestionFrom = null;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oMissionObject.ingestionFrom) && this.m_oMissionObject.ingestionFrom !== "") {
      oAdvancedIngestionFrom = this.m_fUtcDateConverter(this.m_oMissionObject.ingestionFrom);
    }
    let oAdvancedIngestionTo = null;
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oMissionObject.ingestionTo) && this.m_oMissionObject.ingestionTo !== "") {
      oAdvancedIngestionTo = this.m_fUtcDateConverter(this.m_oMissionObject.ingestionTo);
    }

    let advancedFilter = {
      sensingPeriodFrom: oAdvancedSensingFrom,
      sensingPeriodTo: oAdvancedSensingTo,
      ingestionFrom: oAdvancedIngestionFrom,
      ingestionTo: oAdvancedIngestionTo
    };

    let sFilterQuery = this.getAdvancedDateFilterQuery(advancedFilter);

    // update advanced filter for save search
    //this.m_oAdvancedSearchService.setAdvancedSearchFilter(advancedFilter, this.m_oModel);
    this.m_oSearchService.setAdvancedFilter(sFilterQuery); //this.m_oAdvancedSearchService.getAdvancedSearchFilter()
  }


  /**
   * Create the Date Filter for the Search Query
   * @param oAdvancedFilter 
   * @returns 
   */
  getAdvancedDateFilterQuery(oAdvancedFilter: any) {
    let sFilter: string = '';

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
   * Convert date to UTC 
   * @param oDate 
   * @returns 
   */
  m_fUtcDateConverter(oDate: any) {
    let oResult = oDate;
    if (oDate != undefined) {
      let utcDate = oDate.toISOString() // parsed as 4:30 UTC
      oResult = utcDate;
    }
    return oResult;
  }

  removeAllAdvancedSavedFilters() {
    this.m_oAdvancedFilter.savedData = [];
    this.updateAdvancedSavedFiltersUi();
  }

  updateAdvancedSavedFiltersUi() {
    if (this.m_oAdvancedFilter.savedData.length == 0) {
      this.setFilterTypeAsTimePeriod();
    }
  }

  /************ MISSION METHODS ************/

  /**
   * Set the active mission to render the mission form
   * @param oMission 
   */
  setActiveMission(oMission) {
    this.m_oActiveMission = oMission;

    this.setMissionFilter(this.m_oActiveMission);
    this.m_aoFilters = this.m_oActiveMission.filters;

    this.m_aoVisibleFilters = this.m_oMissionFiltersService.setFilterVisibility(oMission.filters, this.m_oMissionObject.missionFilter);
  }

  /**
   * Take the filter string and format it as an array for displaying in the client
   * @param oFilter 
   * @returns 
   */
  prepMissionFilter(oFilter: any) {
    if (oFilter.indexvalues && oFilter.indexvalues !== '') {
      return oFilter.indexvalues.split('|')
    }
  }

  /**
   * On changes to the mission input, listen for the changes and check if the inputs must change
   * @param oMissionSelection 
   * @param oInputFilter 
   * @returns 
   */
  getMissionInput(oMissionSelection: any, oInputFilter: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMissionSelection) === true) {
      return false;
    }

    let changedMission = this.m_oActiveMission;

    //Get set the value of the filter: 
    changedMission.filters.forEach(oFilter => {
      if (oFilter.indexname === oInputFilter.indexname) {
        oFilter.indexvalue = oMissionSelection.value;
      }
    })

    this.setMissionFilter(changedMission);
    this.m_aoVisibleFilters = this.m_oMissionFiltersService.setFilterVisibility(this.m_oActiveMission.filters, this.m_oMissionObject.missionFilter);
    return true;
  }

  getMultiSelectInput(oMissionSelection, oInputFilter) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMissionSelection) === true) {
      return false;
    }
    let changedMission = this.m_oActiveMission;

    //Get set the value of the filter: 
    changedMission.filters.forEach(oFilter => {
      if (oFilter.indexname === oInputFilter.indexname && oFilter.indexlabel === oInputFilter.indexlabel) {
        console.log(oMissionSelection.value)
        oFilter.indexvalue = oMissionSelection.value.toString()
      }
    });

    this.setMissionFilter(changedMission);

    return true;
  }

  /**
   * Set the mission filter in the Mission Filter Service, the Search Service, and the Mission Model
   * @param oActiveMission 
   */
  setMissionFilter(oActiveMission) {
    console.log(oActiveMission);
    this.m_oMissionFiltersService.setAdvancedFilter(oActiveMission)
    this.m_oMissionObject.missionFilter = this.m_oMissionFiltersService.getAdvancedFilter();
    this.m_oSearchService.setMissionFilter(this.m_oMissionObject.missionFilter);

    //Emit Mission Model Changes to Search Component
    this.emitModelChanges();
  }

  /************ EMISSION TO PARENT CONTROLLER (SEARCH COMPONENT) METHODS ************/

  /**
   * Emit changes to the Mission Object to the Parent - will set m_oModel Variable
   */
  emitModelChanges() {
    // Get long form date from User Input: 
    this.m_oMissionObject.sensingPeriodFrom = new Date(this.m_sDateFrom);
    this.m_oMissionObject.sensingPeriodTo = new Date(this.m_sDateTo);

    //Ensure value is initalized before executing setAdvancedSearchFilter()
    if (this.m_sDateFrom !== '' && this.m_sDateTo !== '') {
      this.setAdvancedSearchFilter();
    }

    // Mission Filter set in this.setMissionFilter on changes to mission inputs
    // Text Query set in ngModel in HTML     

    //Update Results of Search Service:
    this.m_oSearchFilter.emit(this.m_oMissionObject);
  }

  /**
   * Emit Provider Selection to the Search Component
   */
  emitSelectedProviders(oEvent: MatSelectChange) {
    this.m_aoUserProviderSelection.forEach(oProvider => {
      oProvider.selected = true;
    })
    this.m_aoProviderSelection.emit(this.m_aoUserProviderSelection);
  }


  openAdvancedSearchFiltersDialog() {
    let oDialogRef = this.m_oDialog.open(AdvancedFiltersComponent, {
      height: '60vh',
      width: '60vw'
    })

    oDialogRef.afterClosed().subscribe(oFilterResults => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oFilterResults) === true) {
        this.setFilterTypeAsTimePeriod();
        return false;
      } else {
        this.m_oAdvancedFilter.savedData = oFilterResults;
        this.m_oAdvancedFilterSelection.emit(this.m_oAdvancedFilter.savedData);
        console.log(this.m_oAdvancedFilter.savedData)
        this.setFilterTypeAsTimeSeries();
        return true;
      }
    })
  }

  removeSavedDataChip(oData) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true) {
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData) === true) {
      return false;
    }
    let iNumberOfSaveData = this.m_oAdvancedFilter.savedData.length;

    for (let iIndexNumberOfSaveData = 0; iIndexNumberOfSaveData < iNumberOfSaveData; iIndexNumberOfSaveData++) {
      if (this.m_oAdvancedFilter.savedData[iIndexNumberOfSaveData] === oData) {
        this.m_oAdvancedFilter.savedData.splice(iIndexNumberOfSaveData, 1);
        this.updateAdvancedSavedFiltersUi();
        break;
      }
    }
    return true;
  }


}
