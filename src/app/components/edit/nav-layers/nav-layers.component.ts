import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faExpand, faList, faX } from '@fortawesome/free-solid-svg-icons';
import { MapService } from 'src/app/services/map.service';
declare const L: any;

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

  //Set opacity to 100% by default
  opacityVal = 100;

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

  //takes oBand
  removeBandImage() {

  }

  setOpacity(event, sLayerId) {
    let iOpacity = event.srcElement.value;
    let oMap = this.m_oMapService.getMap();
    let fPercentage = iOpacity / 100;

    oMap.eachLayer(function (layer) {
      if (layer.options.layers == ("wasdi:" + sLayerId) || layer.options.layers == sLayerId) {
        console.log(layer.options.opacity)
        layer.setOpacity(fPercentage);
      }
    });
  }
}
