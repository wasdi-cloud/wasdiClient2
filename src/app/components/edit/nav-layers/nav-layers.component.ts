import { Component } from '@angular/core';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-nav-layers',
  templateUrl: './nav-layers.component.html',
  styleUrls: ['./nav-layers.component.css']
})
export class NavLayersComponent {

  faX = faX; 
  m_bShowContent: boolean = false; 

  constructor() {
    
  }
}
