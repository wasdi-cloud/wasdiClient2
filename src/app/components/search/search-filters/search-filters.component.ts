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

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {

  @Input() m_aoMissions: Array<any> = [];
  @Output() m_oSearchFilter: any = new EventEmitter();
  @Output() m_aoProviderSelection: any = new EventEmitter();

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

  m_oActiveMission: any = null;
  m_aoSelectedProviders = []
  m_aListOfProviders: any = [];

  m_aoFilters: Array<any> = [];
  m_aoVisibleFilters: Array<any> = [];

  m_sDateTo: string = '';
  m_sDateFrom: string = '';

  constructor(
    private m_oAdvancedSearchService: AdvancedSearchService,
    private m_oDialog: MatDialog,
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
  }

  /************ SET DEFAULT VALUE METHODS ************/

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
    this.m_aListOfProviders = this.m_oPagesService.getProviders()
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
   * Convert date to UTC 
   * @param oDate 
   * @returns 
   */
  m_fUtcDateConverter(oDate: any) {
    var result = oDate;
    if (oDate != undefined) {
      let utcDate = oDate.toISOString() // parsed as 4:30 UTC
      result = utcDate;
    }
    return result;
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
  prepMissionFilter(oFilter) {
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
  getMissionInput(oMissionSelection, oInputFilter) {
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

  /**
   * Set the mission filter in the Mission Filter Service, the Search Service, and the Mission Model
   * @param oActiveMission 
   */
  setMissionFilter(oActiveMission) {
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
    this.m_aoSelectedProviders.forEach(oProvider => {
      oProvider.selected = true;
    })
    this.m_aoProviderSelection.emit(this.m_aoSelectedProviders);
  }


  openAdvancedSearchFiltersDialog() {
    this.m_oDialog.open(AdvancedFiltersComponent, {
      height:'60vh',
      width: '60vw'
    })
  }
}
