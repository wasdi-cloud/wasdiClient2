import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faExpand, faList, faX } from '@fortawesome/free-solid-svg-icons';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-nav-layers',
  templateUrl: './nav-layers.component.html',
  styleUrls: ['./nav-layers.component.css']
})
export class NavLayersComponent implements OnChanges {
  //Font Awesome Icons:
  faExpand = faExpand;
  faList = faList;
  faX = faX;

  @Input() m_b2DMapModeOn: boolean;
  @Input() m_aoVisibleBands
  @Input() m_aoProducts: any[] = [];

  m_sActiveTab: string = 'nav';
  m_iOpacity: string;
  thumbLabel = true;

  constructor(
    private m_oMapService: MapService
  ) { }

  ngOnChanges(): void {
    if (this.m_aoVisibleBands !== undefined) {
      this.setActiveTab('layers');
    }
  }
  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  getOpacity(event) {
    console.log(event.srcElement.value)
  }

  //takes oBand
  removeBandImage() {

  }

}
