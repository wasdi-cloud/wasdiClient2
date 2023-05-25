import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import * as L from "leaflet";
import { MapService } from 'src/app/services/map.service';
import { GlobeService } from 'src/app/services/globe.service';
import Geocoder from 'leaflet-control-geocoder';
import { faGlobeAfrica, faHome, faInfoCircle, faLocationArrow, faMap, faNavicon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-map',
  templateUrl: './edit-map.component.html',
  styleUrls: ['./edit-map.component.css']
})
export class EditMapComponent implements OnInit {
  //Font Awesome Imports
  faHome = faHome;
  faArrow = faLocationArrow;
  faNavicon = faNavicon;
  faInfo = faInfoCircle;
  faGlobe = faGlobeAfrica;
  faMap = faMap;

  searchControl: Geocoder = new Geocoder;
  mapOptions: any;
  layersControl: any;
  editMap: L.Map;
  layersControlOptions = { position: 'bottomleft' }
  m_b2DMapModeOn = true;

  @Input() m_aoProducts: any[] = [];
  @Output() m_b2DMapModeOutput = new EventEmitter();

  constructor(
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  ngOnInit(): void {
    this.mapOptions = this.m_oMapService.m_oOptions;
    this.mapOptions.zoomControl = false;
    this.layersControl = this.m_oMapService.m_oLayersControl;
    this.m_oGlobeService.initGlobe('CesiumContainerEdit');
  }

  onMapReady(map: L.Map) {
    this.editMap = map
    this.searchControl.setPosition('bottomleft');
    this.searchControl.addTo(this.editMap);
    this.m_oMapService.setMap(this.editMap);


  }

  switch2D3DMode() {
    this.m_b2DMapModeOn = !this.m_b2DMapModeOn;

    if (this.m_b2DMapModeOn === false) {
      this.m_b2DMapModeOutput.emit(false);
      this.m_oGlobeService.clearGlobe();
      this.m_oGlobeService.initGlobe('CesiumContainerEdit');
    }
    if (this.m_b2DMapModeOn === true) {
      this.m_b2DMapModeOutput.emit(true);
    }
  }

  goWorkspaceHome() {
    if (this.m_b2DMapModeOn) {
      this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    } else {
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
  }
}
