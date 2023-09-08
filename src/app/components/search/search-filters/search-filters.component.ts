import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { SearchService } from 'src/app/search.service';
import { MissionFiltersService } from 'src/app/services/mission-filters.service';
import { PagesService } from 'src/app/services/pages.service';
import { ResultOfSearchService } from 'src/app/services/result-of-search.service';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {

  @Input() m_aoMissions: Array<any> = [];
  m_aListOfProviders: Array<any> = [];
  m_oActiveMission: any = null;
  m_aoFilters: Array<any> = [];

  m_oMissionObject: any = {
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
  };

  m_aoVisibleFilters: Array<any> = [];

  constructor(
    private m_oPagesService: PagesService,
    private m_oMissionFiltersService: MissionFiltersService,
    private m_oResultsOfSearchService: ResultOfSearchService,
    private m_oSearchService: SearchService
  ) {
    this.m_aListOfProviders = this.m_oPagesService.getProviders();

  }


  ngOnInit(): void {
    this.setActiveMission(this.m_aoMissions[0]);
  }
  /**
   * Set default data
   */
  setDefaultData() {
    let oToDate = new Date();
  }

  /**
   * Set the active mission to render the mission form
   * @param oMission 
   */
  setActiveMission(oMission) {
    this.m_oActiveMission = oMission;
    console.log(this.m_oActiveMission);

    this.setMissionFilter(this.m_oActiveMission);
    this.m_aoFilters = this.m_oActiveMission.filters;

    this.m_aoVisibleFilters = this.m_oMissionFiltersService.setFilterVisibility(oMission.filters, this.m_oMissionObject.missionFilter);
  }

  getMissionFilters(oMissionFilters) {

    return oMissionFilters;
  }

  prepMissionFilter(oFilter) {
    if (oFilter.indexvalues && oFilter.indexvalues !== '') {
      return oFilter.indexvalues.split('|')
    }
  }

  getMissionInput(oMissionSelection, oInputFilter) {
    console.log(oMissionSelection.value)
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMissionSelection) === true) {
      return false;
    }

    let changedMission = this.m_oActiveMission; 

    //Get set the value of the filter: 
    changedMission.filters.forEach(oFilter => {
      if(oFilter.indexname === oInputFilter.indexname) {
        oFilter.indexvalue = oMissionSelection.value;
      }
    })

    this.setMissionFilter(changedMission);
    this.m_aoVisibleFilters = this.m_oMissionFiltersService.setFilterVisibility(this.m_oActiveMission.filters, this.m_oMissionObject.missionFilter);
    return true;
  }

  setMissionFilter(oActiveMission) {
    this.m_oMissionFiltersService.setAdvancedFilter(oActiveMission)
    this.m_oMissionObject.missionFilter = this.m_oMissionFiltersService.getAdvancedFilter();
    console.log(this.m_oMissionObject.missionFilter);
    this.m_oSearchService.setMissionFilter(this.m_oMissionObject.missionFilter);
  }
}
