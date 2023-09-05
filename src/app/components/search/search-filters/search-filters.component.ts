import { Component, OnInit, Input } from '@angular/core';
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

  constructor(
    private m_oPagesService: PagesService,
    private m_oResultsOfSearchService: ResultOfSearchService
  ) { }

  ngOnInit(): void {
      this.m_aListOfProviders = this.m_oPagesService.getProviders(); 
      console.log(this.m_aoMissions);
  }

  /**
   * Set default data
   */
  setDefaultData() {
    let oToDate = new Date();
  }

  getMissions() {
    //this.m_oResultsOfSearchService.getMissions().subscribe
  }
}
