import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import * as L from 'leaflet';

@Component({
  selector: 'app-plan-map',
  templateUrl: './plan-map.component.html',
  styleUrls: ['./plan-map.component.css']
})
export class PlanMapComponent {

  /**
   * Array of the elements drawn on the map
   */
  m_aoDrawnItems: any;

  /**
   * Layers control
   */
  m_oLayersControl: any;

  /**
   * Draw options
   */
  m_oDrawOptions: any;

  /**
   * Maps Options
   */
  m_oMapOptions: any;

  /**
   * Layers' GeoJson
   */
  m_oGeoJSON: any;

  /**
   * String representation of the Polygon
   */
  m_sPolygon: string;

  /**
   * Event for the search params
   */
  @Output() m_oSearchInputhange = new EventEmitter;

  constructor(public m_oMapService: MapService) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oLayersControl = this.m_oMapService.m_oLayersControl;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_aoDrawnItems = this.m_oMapService.m_oDrawnItems;

    this.m_oDrawOptions.edit.featureGroup = this.m_aoDrawnItems;
  }

  onMapReady(oMap: L.Map): void {
    this.m_oMapService.setMap(oMap);
  }


  ngOnDestroy(): void {
    FadeoutUtils.verboseLog("PlanMapComponent.ngOnDestroy")
    this.m_oMapService.setMap(null);
  }    

  onDrawCreated(oEvent): void {
    let oLayer = oEvent.layer;
    if (this.m_aoDrawnItems && this.m_aoDrawnItems.getLayers().length !== 0) {
      this.m_aoDrawnItems.clearLayers();
    }
    this.m_aoDrawnItems.addLayer(oLayer);

    this.m_oGeoJSON = oLayer.toGeoJSON();
    this.m_sPolygon = this.getPolygon();

    //Emit Changes to Search Orbit Component: 
    this.emitMapInputs();
  }

  /**
   * Get the Polygon Coordinates from the GeoJson
   * @returns {string}
   */
  getPolygon(): string {
    let sCoordinatesPolygon = "";
    let iLengthCoordinates;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oGeoJSON.geometry)) {
      return sCoordinatesPolygon;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oGeoJSON.geometry.coordinates)) {
      iLengthCoordinates = 0;
    }
    else {
      iLengthCoordinates = this.m_oGeoJSON.geometry.coordinates.length;
    }

    for (let iLayerCount = 0; iLayerCount < iLengthCoordinates; iLayerCount++) {

      let oLayer = this.m_oGeoJSON.geometry.coordinates[iLayerCount];
      for (let iCoordCount = 0; iCoordCount < oLayer.length; iCoordCount++) {
        if (oLayer[iCoordCount].length == 2) {
          let x = oLayer[iCoordCount][0];
          let y = oLayer[iCoordCount][1];
          sCoordinatesPolygon += (x + " " + y);

          if (iCoordCount + 1 < oLayer.length)
            sCoordinatesPolygon += ',';
        }
      }
    }
    return sCoordinatesPolygon;
  }

  emitMapInputs() {
    this.m_oSearchInputhange.emit({
      geoJSON: this.m_oGeoJSON,
      polygon: this.m_sPolygon
    });
  }
}
