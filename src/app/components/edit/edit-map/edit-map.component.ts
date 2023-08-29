import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as L from "leaflet";
import { Map } from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { GlobeService } from 'src/app/services/globe.service';
import Geocoder from 'leaflet-control-geocoder';
import { faGlobeAfrica, faHome, faInfoCircle, faLocationArrow, faMap, faNavicon } from '@fortawesome/free-solid-svg-icons';
import { latLng } from 'leaflet';
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
  @ViewChild('editMap') editMapContainer: Map;

  constructor(
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  ngAfterViewInit() {
    this.m_oGlobeService.initGlobe('cesiumContainerEdit');
  }
  ngOnInit(): void {
    this.m_oMapService.initWasdiMap('editMap');
    this.layersControl = this.m_oMapService.m_oLayersControl;

  }

  onMapReady(map: L.Map) {
  }

  switch2D3DMode() {
    this.m_b2DMapModeOn = !this.m_b2DMapModeOn;

    if (this.m_b2DMapModeOn === false) {
      this.m_oGlobeService.clearGlobe();
      this.m_oGlobeService.initGlobe('CesiumContainerEdit');
      this.m_b2DMapModeOutput.emit(false);
    }
    if (this.m_b2DMapModeOn === true) {
      this.m_oMapService.clearMap('editMap');
      this.m_oMapService.initWasdiMap('editMap');
      this.m_b2DMapModeOutput.emit(true);
      setTimeout(() => {
        console.log(this.m_oMapService.getMap());
        this.m_oMapService.getMap().invalidateSize();
      }, 300)
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
