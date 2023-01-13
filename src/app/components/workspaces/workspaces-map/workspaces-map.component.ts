import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-workspaces-map',
  templateUrl: './workspaces-map.component.html',
  styleUrls: ['./workspaces-map.component.css']
})
export class WorkspacesMapComponent implements OnInit {
  map:any;

  ngOnInit() {
    this.map = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    


  }
}
