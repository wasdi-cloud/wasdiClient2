import { Component } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { MapService } from 'src/app/services/map.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

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
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
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

  executeSeach() {

  }

  openAddToWorkspaceDialog() {

  }
}
