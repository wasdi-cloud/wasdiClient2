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
    var BMNGLayer = new WorldWind.BMNGLayer();
    var starFieldLayer = new WorldWind.StarFieldLayer();
    var atmosphereLayer = new WorldWind.AtmosphereLayer();

    wwd.addLayer(BMNGLayer);
    wwd.addLayer(starFieldLayer); 
    wwd.addLayer(atmosphereLayer);
    wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));


    wwd.redraw();
  }
}
