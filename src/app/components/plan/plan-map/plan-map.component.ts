import { Component } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-plan-map',
  templateUrl: './plan-map.component.html',
  styleUrls: ['./plan-map.component.css']
})
export class PlanMapComponent {
  constructor(public m_oMapService: MapService) { }
}
