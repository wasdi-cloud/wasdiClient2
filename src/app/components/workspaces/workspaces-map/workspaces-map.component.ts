import { Component } from "@angular/core";
import { latLng, Map, tileLayer, featureGroup } from "leaflet";
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import * as L from "leaflet";
import { MapService } from "src/app/services/map.service";

@Component({
  selector: 'app-workspaces-map',
  templateUrl: './workspaces-map.component.html',
  styleUrls: ['./workspaces-map.component.css']
})
export class WorkspacesMapComponent {
constructor(public m_oMapService: MapService) {}
}
