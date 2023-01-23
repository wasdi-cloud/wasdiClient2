import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-wap-select-area',
  templateUrl: './wap-select-area.component.html',
  styleUrls: ['./wap-select-area.component.css']
})
export class WapSelectAreaComponent implements OnInit {
  oMap: any;

  ngOnInit() {
    this.oMap = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.oMap);



  }
}
