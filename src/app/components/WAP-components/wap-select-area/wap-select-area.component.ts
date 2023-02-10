import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-wap-select-area',
  templateUrl: './wap-select-area.component.html',
  styleUrls: ['./wap-select-area.component.css']
})
export class WapSelectAreaComponent {
  @Input() oMapInput;
  @Output() oMapInputChange = new EventEmitter;

  constructor(public m_oMapService: MapService) { }
}
