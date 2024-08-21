import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

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
import { OpenSearchService } from 'src/app/services/api/open-search.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit, OnChanges {

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
    listOfYears: this.getLastNYears(20),
    listOfMonths: this.getListOfMonths(),
    listOfDays: this.getListOfDays(31),
    listOfSeasons: this.getSeasonsList(),
    selectedYears: [],
    selectedMonths: [],
    selectedDays: [],
    selectedSeasons: [],
    savedData: [],
    selectedSeasonYears: [],
    selectedSeason: "",
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
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oResultsOfSearchService: ResultOfSearchService,
    private m_oSearchService: SearchService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.setActiveMission(this.m_aoMissions[0]);
    this.setDefaultDateData();
    this.setDefaultSelectedProvider();
    this.setAdvancedSearchFilter();
    this.setFilterTypeAsTimePeriod();
    this.initDefaultYears();//TODO REMOVE IT
    this.initDefaultMonths();//TODO REMOVE IT
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.m_aoMissions.length > 0) {
      this.setActiveMission(this.m_aoMissions[0]);
    }
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
    if (this.m_oActiveMission && this.m_oActiveMission.filters) {
      this.m_aoFilters = this.m_oActiveMission.filters;
      this.m_aoVisibleFilters = this.m_oMissionFiltersService.setFilterVisibility(oMission.filters, this.m_oMissionObject.missionFilter);
    }

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
    this.m_oMissionFiltersService.setAdvancedFilter(oActiveMission)
    this.m_oMissionObject.missionFilter = this.m_oMissionFiltersService.getAdvancedFilter();
    this.m_oSearchService.setMissionFilter(this.m_oMissionObject.missionFilter);

    //Emit Mission Model Changes to Search Component
    // this.emitModelChanges();
  }

  /**
   * Handler for mission text query (search product) changes
   * @param oEvent 
   */
  setMissionTextQuery(oEvent) {
    this.m_oMissionObject.textQuery = oEvent.event.target.value;
  }


  /************ EMISSION TO PARENT CONTROLLER (SEARCH COMPONENT) METHODS ************/

  /**
   * Emit changes to the Mission Object to the Parent - will set m_oModel Variable
   */
  emitModelChanges(oEvent) {
    // Get long form date from User Input: 
    if (oEvent.label === 'From') {
      this.m_sDateFrom = oEvent.event.target.value
      this.m_oMissionObject.sensingPeriodFrom = new Date(this.m_sDateFrom);
    } else if (oEvent.label === 'To') {
      this.m_sDateTo = oEvent.event.target.value
      this.m_oMissionObject.sensingPeriodTo = new Date(this.m_sDateTo);
    }
    //Ensure value is initalized before executing setAdvancedSearchFilter()
    if (this.m_sDateFrom !== '' && this.m_sDateTo !== '') {
      this.setAdvancedSearchFilter();
    }

    //Update Results of Search Service:

  }

  /**
   * Notification to Parent on when to execute the search
   */
  executeSearch() {
    if (this.checkValidDates() === true) {
      this.m_oSearchFilter.emit(this.m_oMissionObject);
    }
  }


  checkValidDates(): boolean {
    let sFirstDate = new Date(this.m_sDateFrom);
    let sSecondDate = new Date(this.m_sDateTo);
    let sCurrentDate = new Date();

    if (sFirstDate > sSecondDate || (sFirstDate > sCurrentDate)) {
      this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("IMPORT_INVALID_DATE_RANGE"), "", "alert")
      return false;
    } else {
      return true
    }
  }

  /**
   * Emit Provider Selection to the Search Component
   */
  emitSelectedProviders(oEvent: MatSelectChange) {
    let oSelectedProvders = oEvent.value;
    oSelectedProvders.forEach(oProvider => {
      oProvider.selected = true;
    })
    this.m_aoProviderSelection.emit(oSelectedProvders);
  }

  /********** Crontab Option Handlers and Initializers **********/
  removeSavedDataChip(oData) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true) {
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData) === true) {
      return false;
    }
    let iNumberOfSavedData = this.m_oAdvancedFilter.savedData.length;

    for (let iIndexNumberOfSaveData = 0; iIndexNumberOfSaveData < iNumberOfSavedData; iIndexNumberOfSaveData++) {
      if (this.m_oAdvancedFilter.savedData[iIndexNumberOfSaveData] === oData) {
        this.m_oAdvancedFilter.savedData.splice(iIndexNumberOfSaveData, 1);
        break;
      }
    }
    return true;
  }

  getPeriod(iMonthFrom: number, iDayFrom: number, iMonthTo: number, iDayTo: number) {
    //Safe Programming check:
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(iMonthFrom) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(iDayFrom) === true) ||
      (FadeoutUtils.utilsIsObjectNullOrUndefined(iMonthTo) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(iDayTo) === true)) {
      return null;
    }
    let dateSensingPeriodFrom = new Date();
    let dateSensingPeriodTo = new Date();
    dateSensingPeriodFrom.setMonth(iMonthFrom);
    dateSensingPeriodFrom.setDate(iDayFrom);
    dateSensingPeriodTo.setMonth(iMonthTo);
    dateSensingPeriodTo.setDate(iDayTo);
    return {
      dateSensingPeriodFrom: dateSensingPeriodFrom,
      dateSensingPeriodTo: dateSensingPeriodTo
    }
  }

  getPeriodSpring() {
    return this.getPeriod(2, 21, 5, 20);
  }

  getPeriodSummer() {
    return this.getPeriod(5, 21, 8, 22);
  }

  getPeriodAutumn() {
    return this.getPeriod(8, 23, 11, 20);
  }

  getPeriodWinter() {
    return this.getPeriod(11, 21, 2, 20);
  }

  saveDataInAdvancedFilter(sName: string, oData: any, aoSavedData?: Array<any>) {
    //Safe Programming Check:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true || FadeoutUtils.utilsIsStrNullOrEmpty(sName) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSavedData)) {
      return false;
    }

    let oInputData = {
      name: sName,
      data: oData
    };

    let iNumberOfSaveData = aoSavedData.length;
    for (let iIndexSaveData = 0; iIndexSaveData < iNumberOfSaveData; iIndexSaveData++) {
      if (aoSavedData[iIndexSaveData].name === oInputData.name) {
        return false;
      }
    }
    aoSavedData.push(oInputData);

    return true;
  }

  removeSaveDataChips(oData: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true)
      return false;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData) === true)
      return false;
    let iNumberOfSaveData = this.m_oAdvancedFilter.savedData.length;

    for (let iIndexNumberOfSaveData = 0; iIndexNumberOfSaveData < iNumberOfSaveData; iIndexNumberOfSaveData++) {
      if (this.m_oAdvancedFilter.savedData[iIndexNumberOfSaveData] === oData) {
        this.m_oAdvancedFilter.savedData.splice(iIndexNumberOfSaveData, 1);
        break;
      }
    }

    return true;
  }

  initDefaultYears() {
    this.m_oAdvancedFilter.listOfYears = this.getLastNYears(20);
  }

  getLastNYears(iNumber: number): Array<any> {
    if (FadeoutUtils.utilsIsInteger(iNumber) === false) {
      return null;
    }
    let aiReturnListOfYeras = [];
    let oActualDate = new Date();
    let iYears = oActualDate.getFullYear();
    for (let iIndexYear = 0; iIndexYear < iNumber; iIndexYear++) {
      aiReturnListOfYeras.push(iYears.toString());
      iYears--;
    }
    return aiReturnListOfYeras;
  }

  initDefaultMonths() {
    /*
              January - 31 days
              February - 28 days in a common year and 29 days in leap years
              March - 31 days
              April - 30 days
              May - 31 days
              June - 30 days
              July - 31 days
              August - 31 days
              September - 30 days
              October - 31 days
              November - 30 days
              December - 31 days
          * */
    let asMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let sMonth of asMonths) {
      this.m_oAdvancedFilter.listOfMonths.push(sMonth);
    }
  }

  getListOfMonths() {
    /*
            January - 31 days
            February - 28 days in a common year and 29 days in leap years
            March - 31 days
            April - 30 days
            May - 31 days
            June - 30 days
            July - 31 days
            August - 31 days
            September - 30 days
            October - 31 days
            November - 30 days
            December - 31 days
        * */
    let asMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let asReturnValue = [];
    for (let iIndex = 0; iIndex < asMonths.length; iIndex++) {
      asReturnValue.push(asMonths[iIndex]);
    }
    return asReturnValue;
  }

  getMonthDays(sMonth: string, sYear: string) {
    let sMonthLowerCase = sMonth.toLocaleLowerCase();
    switch (sMonthLowerCase) {
      case "january":
        return 31;
      case "february":

        if (FadeoutUtils.utilsLeapYear(sYear)) {
          return 29
        }
        else {
          return 28;
        }
      case "march":
        return 31;
      case "april":
        return 30;
      case "may":
        return 31;
      case "june":
        return 30;
      case "july":
        return 31;
      case "august":
        return 31;
      case "september":
        return 30;
      case "october":
        return 31;
      case "november":
        return 30;
      case "december":
        return 31;
      //Default 0 to catch possible error:
      default:
        return 0;
    }
  }

  getListOfDays(iNumberOfDays: number) {
    if (FadeoutUtils.utilsIsInteger(iNumberOfDays) === false) {
      return [];
    }
    let asReturnValue = [];
    for (let iIndex = 0; iIndex < iNumberOfDays; iIndex++) {
      asReturnValue.push((iIndex + 1).toString());
    }
    return asReturnValue;
  }

  getMonthDaysFromRangeOfMonths(sMonth: string, asYears: Array<string>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asYears) === true)
      return [];
    if (asYears.length < 1)
      return [];
    let iNumberOfYears = asYears.length;
    let sMonthLowerCase = sMonth.toLocaleLowerCase();
    let iReturnValue = 0;
    if ((sMonthLowerCase === "february")) {
      for (let iIndexYear = 0; iIndexYear < iNumberOfYears; iIndexYear++) {
        let iTemp = this.getMonthDays(sMonth, asYears[iIndexYear])
        //if true it takes the new value, in the case of leap years it takes 29 days
        if (iTemp > iReturnValue)
          iReturnValue = iTemp;
      }
    }
    else {
      iReturnValue = this.getMonthDays(sMonth, asYears[0]);
    }
    return FadeoutUtils.utilsGenerateArrayWithFirstNIntValue(1, iReturnValue);
  }

  convertNameMonthInNumber(sName: string) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sName) === true)
      return -1;

    let sMonthLowerCase = sName.toLocaleLowerCase();
    switch (sMonthLowerCase) {
      case "january":
        return 0;
      case "february":
        return 1;
      case "march":
        return 2;
      case "april":
        return 3;
      case "may":
        return 4;
      case "june":
        return 5;
      case "july":
        return 6;
      case "august":
        return 7;
      case "september":
        return 8;
      case "october":
        return 9;
      case "november":
        return 10;
      case "december":
        return 11;

    }
    return -1;
  }

  addFilterMonths() {
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedYearsSearchForMonths) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedMonthsSearchForMonths) === true)) {
      return false;
    }
    let iNumberOfSelectedYears = this.m_oAdvancedFilter.selectedYearsSearchForMonths.length;
    let iNumberOfSelectedMonths = this.m_oAdvancedFilter.selectedMonthsSearchForMonths.length;

    for (let iIndexYear = 0; iIndexYear < iNumberOfSelectedYears; iIndexYear++) {
      for (let iIndexMonth = 0; iIndexMonth < iNumberOfSelectedMonths; iIndexMonth++) {
        let sName = this.m_oAdvancedFilter.selectedYearsSearchForMonths[iIndexYear].toString() + " " + this.m_oAdvancedFilter.selectedMonthsSearchForMonths[iIndexMonth];
        let dateSensingPeriodFrom = new Date();
        let dateSensingPeriodTo = new Date();
        dateSensingPeriodFrom.setFullYear(this.m_oAdvancedFilter.selectedYearsSearchForMonths[iIndexYear]);
        dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(this.m_oAdvancedFilter.selectedMonthsSearchForMonths[iIndexMonth]));
        dateSensingPeriodFrom.setDate(1);
        dateSensingPeriodTo.setFullYear(this.m_oAdvancedFilter.selectedYearsSearchForMonths[iIndexYear]);
        dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(this.m_oAdvancedFilter.selectedMonthsSearchForMonths[iIndexMonth]));
        dateSensingPeriodTo.setDate(this.getMonthDays(this.m_oAdvancedFilter.selectedMonthsSearchForMonths[iIndexMonth], this.m_oAdvancedFilter.selectedYearsSearchForMonths[iIndexYear]));
        let oData = {
          dateSensingPeriodFrom: dateSensingPeriodFrom,
          dateSensingPeriodTo: dateSensingPeriodTo
        };
        this.saveDataInAdvancedFilter(sName, oData);
      }
    }
    return true;
  }

  getSeasonsList() {
    return ["Spring", "Summer", "Autumn", "Winter"];
  }

  removeSavedData() {
    this.m_oAdvancedFilter.savedData = [];
  }

  addFiltersData() {
    let iNumberOfSelectedYears = this.m_oAdvancedFilter.selectedYears.length;
    for (let iIndexYear = 0; iIndexYear < iNumberOfSelectedYears; iIndexYear++) {
      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedSeasons) === false) &&
        (this.m_oAdvancedFilter.selectedSeasons.length > 0)) {
        this.addSeason(this.m_oAdvancedFilter.selectedSeasons, this.m_oAdvancedFilter.selectedYears[iIndexYear], this.m_oAdvancedFilter.savedData);
      }
      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedMonths) === false) &&
        (this.m_oAdvancedFilter.selectedMonths.length > 0)) {
        this.addMonths(this.m_oAdvancedFilter.selectedMonths, this.m_oAdvancedFilter.selectedYears[iIndexYear], this.m_oAdvancedFilter.savedData);
      }

      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedMonths) === false) &&
        (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.selectedDays) === false) &&
        (this.m_oAdvancedFilter.selectedDays.length > 0)) {
        this.addFilterPeriods(this.m_oAdvancedFilter.selectedMonths, this.m_oAdvancedFilter.selectedDays,
          this.m_oAdvancedFilter.selectedYears[iIndexYear], this.m_oAdvancedFilter.savedData);
      }
    }
  }

  addMonths(asSelectedMonths: Array<string>, iYear: any, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedMonths) || FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false;
    }

    let iNumberOfSelectedMonths = asSelectedMonths.length;
    for (let iIndexMonth = 0; iIndexMonth < iNumberOfSelectedMonths; iIndexMonth++) {
      let sName = iYear.toString() + " " + asSelectedMonths[iIndexMonth];
      let dateSensingPeriodFrom = new Date();
      let dateSensingPeriodTo = new Date();
      dateSensingPeriodFrom.setFullYear(iYear);
      dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexMonth]));
      dateSensingPeriodFrom.setDate(1);

      dateSensingPeriodTo.setFullYear(iYear);
      dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexMonth]));
      dateSensingPeriodTo.setDate(this.getMonthDays(asSelectedMonths[iIndexMonth], iYear));
      let oData = {
        dateSensingPeriodFrom: dateSensingPeriodFrom,
        dateSensingPeriodTo: dateSensingPeriodTo
      };
      this.saveDataInAdvancedFilter(sName, oData, aoSaveData);
    }
    return true;
  }

  addFilterPeriods(asSelectedMonths: Array<string>, asSelectedDays: Array<string>, iYear: number, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedMonths) || FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedDays) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false
    }
    let iNumberOfSelectedMonths = asSelectedMonths.length;
    for (let iIndexSelectedMonth = 0; iIndexSelectedMonth < iNumberOfSelectedMonths; iIndexSelectedMonth++) {
      let aiSelectedDays = this.convertArrayOfStringInArrayOfInteger(asSelectedDays);
      let aaiPeriodsOfTimes = this.getPeriodsOfTimes(aiSelectedDays);
      let iNumberOfPeriodsOfTimes = aaiPeriodsOfTimes.length;
      //TODO END IT
      for (let iIndexPeriodOfTimes = 0; iIndexPeriodOfTimes < iNumberOfPeriodsOfTimes; iIndexPeriodOfTimes++) {
        let sNameChips = "";
        if (aaiPeriodsOfTimes[iIndexPeriodOfTimes].length > 1) {

          let iDayFrom = aaiPeriodsOfTimes[iIndexPeriodOfTimes][0];
          let iDayTo = aaiPeriodsOfTimes[iIndexPeriodOfTimes][aaiPeriodsOfTimes[iIndexPeriodOfTimes].length - 1];

          sNameChips += iDayFrom.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += " - " + iDayTo.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += " " + iYear;

          let dateSensingPeriodFrom = new Date();
          let dateSensingPeriodTo = new Date();

          dateSensingPeriodFrom.setFullYear(iYear);
          dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriodFrom.setDate(iDayFrom);

          // TODO CHECK LEAP YEAS (29 DAYS FEBRUARY)
          dateSensingPeriodTo.setFullYear(iYear);
          dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriodTo.setDate(iDayTo);
          let oData = {
            dateSensingPeriodFrom: dateSensingPeriodFrom,
            dateSensingPeriodTo: dateSensingPeriodTo
          };
          this.saveDataInAdvancedFilter(sNameChips, oData, aoSaveData);

        }
        else {
          let iDay = aaiPeriodsOfTimes[iIndexPeriodOfTimes][0];
          sNameChips += iDay.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += "/" + iYear.toString();

          let dateSensingPeriod = new Date();
          dateSensingPeriod.setFullYear(iYear);
          dateSensingPeriod.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriod.setDate(iDay);

          let oData = {
            dateSensingPeriodFrom: dateSensingPeriod,
            dateSensingPeriodTo: dateSensingPeriod
          };

          this.saveDataInAdvancedFilter(sNameChips, oData, aoSaveData);
        }
      }
    }
    return true;
  }

  savePeriodOfTime(aiPeriodOfTime: Array<number>, sMonth: string, iYear: number) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aiPeriodOfTime)) {
      return false;
    }
    let iNumberOfDays = aiPeriodOfTime.length;
    let iSelectedDayFrom = aiPeriodOfTime[0];
    let iSelectedDayTo = aiPeriodOfTime[iNumberOfDays];
    let sName = "";
    sName += iSelectedDayFrom.toString() + " - " + iSelectedDayTo + "/" + this.convertNameMonthInNumber(sMonth) + "/" + iYear;
    // sName +=  " - " +this.m_oAdvanceFilter.selectedDayTo.toString() + "/" + this.m_oAdvanceFilter.selectedMonthTo.toString();
    // sName += " " + this.m_oAdvanceFilter.selectedYears[iIndexYear].toString();

    let dateSensingPeriodFrom = new Date();
    let dateSensingPeriodTo = new Date();
    dateSensingPeriodFrom.setFullYear(iYear);
    dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(sMonth));
    // TODO CHECK LEAP YEAS (29 DAYS FEBRUARY)
    dateSensingPeriodFrom.setDate(iSelectedDayFrom);
    dateSensingPeriodTo.setFullYear(iYear);
    dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(sMonth));
    dateSensingPeriodTo.setDate(iSelectedDayTo);
    let oData = {
      dateSensingPeriodFrom: dateSensingPeriodFrom,
      dateSensingPeriodTo: dateSensingPeriodTo
    };
    this.saveDataInAdvancedFilter(sName, oData);
    return true;
  }

  convertArrayOfStringInArrayOfInteger(asArray: Array<string>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asArray) === true) {
      return null;
    }
    let iNumberOfElement = asArray.length;
    let aiReturnArray = [];
    for (let iIndexArray = 0; iIndexArray < iNumberOfElement; iIndexArray++) {
      aiReturnArray.push(parseInt(asArray[iIndexArray]));
    }
    return aiReturnArray;
  }

  getPeriodsOfTimes(aiDays: Array<number>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aiDays)) {
      return null;
    }
    let aaiReturnPeriodsOfTimes = [[]];
    let iIndexReturnPeriodOfTime = 0;

    aiDays.sort();
    let iNumberOfDays = aiDays.length;
    aaiReturnPeriodsOfTimes[iIndexReturnPeriodOfTime].push(aiDays[0]);
    for (let iIndexDay = 1; iIndexDay < iNumberOfDays; iIndexDay++) {
      /*
      * example aiDays = [1,2,7,9]
      * iIndexDay = 1;
      * if( (aiDays[iIndexDay - 1 ] + 1 ) === aiDays[iIndexDay])
      *
      * aiDays[iIndexDay - 1 ] = 1
      *
      * (aiDays[iIndexDay - 1 ] + 1 ) = (1+1)
      *
      * aiDays[iIndexDay] = 2
      *
      * if( (1+1) === 2 ) aiDays[iIndexDay] and aiDays[iIndexDay-1] are a period of times because they are in sequence
      *
      * */
      if ((aiDays[iIndexDay - 1] + 1) === aiDays[iIndexDay]) {
        aaiReturnPeriodsOfTimes[iIndexReturnPeriodOfTime].push(aiDays[iIndexDay]);
      }
      else {
        //Push array
        let aiNewPeriodOfTime = [aiDays[iIndexDay]];
        aaiReturnPeriodsOfTimes.push(aiNewPeriodOfTime);
        iIndexReturnPeriodOfTime++;
      }
    }
    return aaiReturnPeriodsOfTimes;
  }

  addSeason(asSeasonsSelected: Array<string>, iYear: number, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSeasonsSelected) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false;
    }
    let iNumberOfSeasonsSelected = asSeasonsSelected.length;
    for (let iIndexSeason = 0; iIndexSeason < iNumberOfSeasonsSelected; iIndexSeason++) {
      let oDataPeriod = null;
      switch (asSeasonsSelected[iIndexSeason].toLowerCase()) {
        case "spring":
          oDataPeriod = this.getPeriodSpring();
          break;
        case "summer":
          oDataPeriod = this.getPeriodSummer();
          break;
        case "autumn":
          oDataPeriod = this.getPeriodAutumn();
          break;
        case "winter":
          oDataPeriod = this.getPeriodWinter();
          break;
      }

      if (asSeasonsSelected[iIndexSeason].toLowerCase() !== "winter") {
        if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodFrom.setYear(iYear);
      } else {
        if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodFrom.setYear(iYear - 1);
      }
      if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodTo.setYear(iYear);
      let sName = iYear.toString() + asSeasonsSelected[iIndexSeason];
      this.saveDataInAdvancedFilter(sName, oDataPeriod, aoSaveData);
    }
    return true;
  }

  cleanAdvanceFilters() {
    this.m_oAdvancedFilter.selectedSeasonYears = [];
    this.m_oAdvancedFilter.selectedYears = [];
    this.m_oAdvancedFilter.selectedDayFrom = "";
    this.m_oAdvancedFilter.selectedDayTo = "";
    this.m_oAdvancedFilter.selectedMonthFrom = "";
    this.m_oAdvancedFilter.selectedMonthTo = "";
    this.m_oAdvancedFilter.selectedYearsSearchForMonths = [];
    this.m_oAdvancedFilter.selectedMonthsSearchForMonths = [];
  }

  removeAllAdvanceSavedFilters() {
    this.m_oAdvancedFilter.savedData = [];
  }

  isEmptyListOfFilters() {
    return (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvancedFilter.savedData) === true || this.m_oAdvancedFilter.savedData.length === 0);
  }

  /********** Selection Change Handlers for CronTab Option **********/
  getSelectedYears(oEvent) {
    if (oEvent.value) {
      this.m_oAdvancedFilter.selectedYears = oEvent.value;
    }
  }

  getSelectedSeasons(oEvent) {
    if (oEvent.value) {
      this.m_oAdvancedFilter.selectedSeasons = oEvent.value;
    }
  }

  getSelectedMonths(oEvent) {
    if (oEvent.value) {
      this.m_oAdvancedFilter.selectedMonths = oEvent.value;
    }
  }

  getSelectedDays(oEvent) {
    if (oEvent.value) {
      this.m_oAdvancedFilter.selectedDays = oEvent.value;
    }
  }
}
