import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MapEngineService } from 'src/app/services/map-engine/map-engine.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
    selector: 'app-wap-select-area',
    templateUrl: './wap-select-area.component.html',
    styleUrls: ['./wap-select-area.component.css'],
    standalone: false
})

/**
 * WASDI Select Area User Control
 */
export class WapSelectAreaComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Map input as described by the User Interface
   */
  @Input() m_oMapInput;

  /**
   * Is the map located on the active tab?
   */
  @Input() m_bParentTabActive: boolean = false;

  /**
   * Event about map changed
   */
  @Output() m_oMapInputChange = new EventEmitter;

  /**
   * Subscription to the event "a bbox has been created"
   */
  m_aoManualBBoxSubscription: any;
  /**
   * Geo Json representation of the area
   */
  m_oGeoJSON: any;
  /**
   * WKT representation of the area
   */
  m_sPolygon: string;

  /**
   * Dynamic map id: each user interface may have more maps...
   */
  m_sMapId: string = `${Date.now() + Math.random()}`;

  /**
   * Local Map reference
   */
  m_oMap: any;

  /**
   * Create the component
   * @param m_oMapEngineService
   */
  constructor(private m_oMapEngineService: MapEngineService) {
    // console.log("Creating WAP Map Component with MapId: " + this.m_sMapId)
  }

  /**
   * Init the component
   */
  ngOnInit(): void {

    // Subscribe to the event that tell us a manual bbox has been drawn
    this.m_aoManualBBoxSubscription = this.m_oMapEngineService.getManualBoundingBox$().subscribe(oResult => {

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
        this.handleSelectionLayer(oResult);
      }
    });

    // Give time to the view to render and then init MapLibre.
    setTimeout(() => {
      const oMap = this.m_oMapEngineService.initMapSingleton(this.m_sMapId);
      this.m_oMap = oMap;

      if (oMap) {
        this.m_oMapEngineService.addManualBoundingBoxControl(oMap);
        this.syncMapSize();
      }
    }, 500);
  }

  ngOnChanges() {
    if (this.m_bParentTabActive === true) {
      this.syncMapSize();
    }
  }

  ngOnDestroy(): void {
    if (this.m_aoManualBBoxSubscription) {
      this.m_aoManualBBoxSubscription.unsubscribe();
    }

    this.m_oMapEngineService.clearMap();
    this.m_oMap = null;
  }

  private syncMapSize(): void {
    if (!this.m_oMap || typeof this.m_oMap.resize !== 'function') {
      return;
    }

    setTimeout(() => {
      if (this.m_oMap && typeof this.m_oMap.resize === 'function') {
        this.m_oMap.resize();
      }
    }, 0);
  }

  private handleSelectionLayer(oLayer: any): void {
    if (!oLayer || !oLayer._bounds) {
      return;
    }

    this.m_oGeoJSON = typeof oLayer.toGeoJSON === 'function' ? oLayer.toGeoJSON() : null;
    this.m_sPolygon = this.getPolygon();

    const bIsValid = this.checkArea(oLayer);
    this.setSelectionValidityStyle(bIsValid);

    if (!bIsValid) {
      this.m_oMapInput.oBoundingBox.northEast = "";
      this.m_oMapInput.oBoundingBox.southWest = "";
      this.m_oMapInputChange.emit(this.m_oMapInput);
      return;
    }

    this.m_oMapInput.oBoundingBox.northEast = oLayer._bounds._northEast;
    this.m_oMapInput.oBoundingBox.southWest = oLayer._bounds._southWest;
    this.m_oMapInputChange.emit(this.m_oMapInput);
  }

  private setSelectionValidityStyle(bIsValid: boolean): void {
    if (!this.m_oMap) {
      return;
    }

    const sFillColor = bIsValid ? '#3388ff' : '#ff0000';
    const sLineColor = bIsValid ? '#3388ff' : '#ff0000';

    if (this.m_oMap.getLayer('search-selection-fill')) {
      this.m_oMap.setPaintProperty('search-selection-fill', 'fill-color', sFillColor);
      this.m_oMap.setPaintProperty('search-selection-fill', 'fill-opacity', 0.2);
    }

    if (this.m_oMap.getLayer('search-selection-line')) {
      this.m_oMap.setPaintProperty('search-selection-line', 'line-color', sLineColor);
      this.m_oMap.setPaintProperty('search-selection-line', 'line-width', 2);
    }
  }

  private getDistanceKm(pointFrom: { lat: number, lng: number }, pointTo: { lat: number, lng: number }): number {
    const fEarthRadiusKm = 6371;
    const fDeltaLat = (pointTo.lat - pointFrom.lat) * Math.PI / 180;
    const fDeltaLng = (pointTo.lng - pointFrom.lng) * Math.PI / 180;

    const fA = Math.sin(fDeltaLat / 2) ** 2
      + Math.cos(pointFrom.lat * Math.PI / 180) * Math.cos(pointTo.lat * Math.PI / 180) * Math.sin(fDeltaLng / 2) ** 2;

    return fEarthRadiusKm * 2 * Math.atan2(Math.sqrt(fA), Math.sqrt(1 - fA));
  }

  checkArea(oLayer): boolean {
    if (!oLayer || !oLayer._bounds || typeof oLayer.getLatLngs !== 'function') {
      return false;
    }

    this.m_oMapInput.oBoundingBox.northEast = oLayer._bounds._northEast;
    this.m_oMapInput.oBoundingBox.southWest = oLayer._bounds._southWest;

    const aoLatLngs = oLayer.getLatLngs();
    if (!Array.isArray(aoLatLngs) || !Array.isArray(aoLatLngs[0]) || aoLatLngs[0].length < 4) {
      return false;
    }

    const oNorthWest = aoLatLngs[0][0];
    const oNorthEast = aoLatLngs[0][1];
    const oSouthEast = aoLatLngs[0][2];

    const fWidth = this.getDistanceKm(oNorthWest, oNorthEast);
    const fHeight = this.getDistanceKm(oNorthEast, oSouthEast);
    const fMaxSide = Math.max(fWidth, fHeight);
    const fMinSide = Math.min(fWidth, fHeight);
    const fRatio = fMinSide > 0 ? fMaxSide / fMinSide : 0;
    const fArea = fWidth * fHeight;

    if (fArea > this.m_oMapInput.maxArea && this.m_oMapInput.maxArea !== 0) {
      // sErrorMessage = sErrorMessage.concat(this.m_oTranslateService.getTranslation());
      return false;
    }

    if (fMaxSide > this.m_oMapInput.maxSide && this.m_oMapInput.maxSide != 0) {
      // sErrorMessage = sErrorMessage.concat($translate.getTranslationTable().WAP_SELECT_AREA_OVER_SIDE);
      return false;
    }

    if (fRatio > this.m_oMapInput.maxRatioSide && this.m_oMapInput.maxRatioSide != 0) {
      // sErrorMessage = sErrorMessage.concat($translate.getTranslationTable().WAP_SELECT_AREA_OVER_RATIO);
      return false;
    }

    return true;
  }

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

}
