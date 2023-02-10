import { Component } from "@angular/core";
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
export class WorkspacesMapComponent {
  map: any;
  searchControl: Geocoder = new Geocoder;
  constructor(public m_oMapService: MapService) { }

  onMapReady(map: L.Map) {

    this.searchControl.setPosition('bottomleft')
    this.searchControl.addTo(map);

  }
}

