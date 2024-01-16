import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import * as L from 'leaflet';

@Component({
  selector: 'app-plan-map',
  templateUrl: './plan-map.component.html',
  styleUrls: ['./plan-map.component.css']
})
export class PlanMapComponent {
  m_bIsValid: boolean;
  m_oDrawnItems: any;
  m_oLayersControl: any;
  m_oDrawOptions: any;
  m_oMapOptions: any;

  @Input() oMapInput: any = {
    maxArea: 0,
    maxRatioSide: 0,
    maxSide: 0,
    oBoundingBox: {
      northEast: '',
      southWest: ''
    }
  };

  m_oSearchInfo = {
    aquisitionEndTime: "",
    aquisitionStartTime: "",
    polygon: "",
    satelliteFilters: []
  }

  m_oGeoJSON;
  m_sPolygon;

  @Output() m_oSearchInputhange = new EventEmitter;

  constructor(public m_oMapService: MapService) {
    //this.m_oMapService.setDrawnItems();
    //this.m_oMapService.initTilelayer();

    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oLayersControl = this.m_oMapService.m_oLayersControl;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;

    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;

    this.m_bIsValid = true;
  }

  onMapReady(oMap: L.Map): void {
    this.m_oMapService.setMap(oMap);
  }



  onDrawCreated(oEvent): void {
    let oLayer = oEvent.layer;
    if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      this.m_oDrawnItems.clearLayers();
    }
    this.m_oDrawnItems.addLayer(oLayer);

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
