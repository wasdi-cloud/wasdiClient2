import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
const WorldWind = require('@nasaworldwind/worldwind')
@Component({
  selector: 'app-workspaces-worldwind',
  templateUrl: './workspaces-worldwind.component.html',
  styleUrls: ['./workspaces-worldwind.component.css']
})
export class WorkspacesWorldwindComponent implements AfterViewInit {

  @ViewChild('scene') scene!: ElementRef;

  constructor() {

  }

  ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('scene');
    let BMNGLayer = new WorldWind.BMNGLayer();
    let starFieldLayer = new WorldWind.StarFieldLayer();
    let atmosphereLayer = new WorldWind.AtmosphereLayer();

    wwd.addLayer(BMNGLayer);
    wwd.addLayer(starFieldLayer);
    wwd.addLayer(atmosphereLayer); 
  }
}
