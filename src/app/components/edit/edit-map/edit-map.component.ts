import { Component, OnInit} from '@angular/core';
import * as L from "leaflet";
import { MapService } from 'src/app/services/map.service';
import Geocoder from 'leaflet-control-geocoder';

@Component({
  selector: 'app-edit-map',
  templateUrl: './edit-map.component.html',
  styleUrls: ['./edit-map.component.css']
})
export class EditMapComponent implements OnInit {
  searchControl: Geocoder = new Geocoder;
  mapOptions: any;
  layersControl: any;
  editMap: L.Map

  constructor(private m_oMapService: MapService) { }

  ngOnInit(): void {
    this.mapOptions = this.m_oMapService.m_oOptions;
    this.layersControl = this.m_oMapService.m_oLayersControl;
  }

  onMapReady(map: L.Map) {
    this.editMap = map; 
    this.searchControl.setPosition('bottomleft')
    this.searchControl.addTo(map);
    this.m_oMapService.setMap(map);
  }
}
