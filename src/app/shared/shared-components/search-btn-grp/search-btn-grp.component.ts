import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-btn-grp',
  templateUrl: './search-btn-grp.component.html',
  styleUrls: ['./search-btn-grp.component.css']
})
export class SearchBtnGrpComponent {
  @Input() m_sLocation: string = null;


  executeSearch(){ 
    
  }
}
