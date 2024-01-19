import { Component } from '@angular/core';
import { HeaderService } from 'src/app/services/header.service';

@Component({
  selector: 'app-market-search',
  templateUrl: './market-search.component.html',
  styleUrls: ['./market-search.component.css']
})
export class MarketSearchComponent {
  m_sSearchInput: string = ""
  constructor(
    private m_oHeaderServvice: HeaderService
  ) { }

  setSearchFilter() {
    this.m_oHeaderServvice.getSearchFilter(this.m_sSearchInput);
  }

  setSortBy() { }
}
