import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare let Cesium: any;

Cesium.Ion.defaultAccessToken = environment.cesiumToken;

@Injectable({
  providedIn: 'root'
})
export class CesiumService {

  constructor() { }

  private viewer: any;

  

  plotPoints(div: string) {
    this.viewer = new Cesium.Viewer(div);
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
      point: {
        color: Cesium.Color.RED,
        pixelSize: 16,
      },
    });
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-80.5, 35.14),
      point: {
        color: Cesium.Color.BLUE,
        pixelSize: 16,
      },
    });
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(-80.12, 25.46),
      point: {
        color: Cesium.Color.YELLOW,
        pixelSize: 16,
      },
    });
  }
}
