import { Component, OnInit } from "@angular/core";
import { latLng, Map, tileLayer, featureGroup } from "leaflet";
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import * as L from "leaflet";
import { MapService } from "src/app/services/map.service";
import Geocoder from "leaflet-control-geocoder";

@Component({
  selector: 'app-workspaces-map',
  templateUrl: './workspaces-map.component.html',
  styleUrls: ['./workspaces-map.component.css']
})
export class WorkspacesMapComponent implements OnInit {
  map: any;
  searchControl: Geocoder = new Geocoder;
  mapOptions: any;
  layersControl: any;
  drawOptions: any;
  drawnItems: any;

  constructor(public m_oMapService: MapService) { }

  ngOnInit(): void {
    console.log("init map")
    this.m_oMapService.setDrawnItems();
    this.mapOptions = this.m_oMapService.m_oOptions;
    this.layersControl = this.m_oMapService.m_oLayersControl;
    this.drawOptions = this.m_oMapService.m_oDrawOptions;
    this.drawnItems = this.m_oMapService.m_oDrawnItems;
  }

  onMapReady(map: L.Map) {
    this.searchControl.setPosition('bottomleft')
    this.searchControl.addTo(map);
  }

  onDrawCreated(event) {
    console.log('drawn in controller')
  }
}

