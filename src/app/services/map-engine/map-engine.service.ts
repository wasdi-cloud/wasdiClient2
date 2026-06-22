import { Injectable } from '@angular/core';
import { IMapEngine } from './map-engine.interface';
import { MapLibreMapEngineAdapter } from './maplibre-map-engine.adapter';
import { MAP_ENGINE_FLAGS } from './map-engine.config';
import { MapInitOptions } from './map-engine.interface';
import {Observable} from "rxjs";

/**
 * Runtime selector for the active map engine implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class MapEngineService implements IMapEngine {
  private readonly m_oEngine: IMapEngine;

  constructor(
    private readonly m_oMapLibreEngine: MapLibreMapEngineAdapter
  ) {
    this.m_oEngine = this.m_oMapLibreEngine;
  }

  isMapLibreEnabled(): boolean {
    return MAP_ENGINE_FLAGS.useMapLibre;
  }

  getOptions(): any { return this.m_oEngine.getOptions(); }
  getDrawOptions(): any { return this.m_oEngine.getDrawOptions(); }
  getDrawnItemsLayer(): any { return this.m_oEngine.getDrawnItemsLayer(); }
  getLayersControl(): any { return this.m_oEngine.getLayersControl(); }

  getManualBoundingBox$() { return this.m_oEngine.getManualBoundingBox$(); }
  getSelectedRectangle$() { return this.m_oEngine.getSelectedRectangle$(); }
  emitSelectedRectangle(event: any): void { this.m_oEngine.emitSelectedRectangle(event); }

  setMap(map: any): void { this.m_oEngine.setMap(map); }
  getMap(): any { return this.m_oEngine.getMap(); }
  initMapSingleton(mapDivId: string, oOptions?: MapInitOptions): any { return this.m_oEngine.initMapSingleton(mapDivId, oOptions); }
  initMap(mapDivId: string, oOptions?: MapInitOptions): void { this.m_oEngine.initMap(mapDivId, oOptions); }
  clearMap(): void { this.m_oEngine.clearMap(); }
  resetDrawnItemsLayer(): void { this.m_oEngine.resetDrawnItemsLayer(); }

  addMousePositionAndScale(map: any): void { this.m_oEngine.addMousePositionAndScale(map); }
  initGeocoder(map: any): void { this.m_oEngine.initGeocoder(map); }
  addManualBoundingBoxControl(map: any, bShowDelete?: boolean): void {
    this.m_oEngine.addManualBoundingBoxControl(map, bShowDelete);
  }
  upsertSelectionRectangle(fWest: number, fSouth: number, fEast: number, fNorth: number): void {
    this.m_oEngine.upsertSelectionRectangle(fWest, fSouth, fEast, fNorth);
  }
  initDrawControl(map: any): void {
    this.m_oEngine.initDrawControl(map);
  }
  getDrawEvents$(): Observable<any> {
    return this.m_oEngine.getDrawEvents$();
  }
  deleteDrawFeature(featureId: string): void {
    this.m_oEngine.deleteDrawFeature(featureId);
  }
  changeDrawMode(mode: string, featureId?: string): void{
    this.m_oEngine.changeDrawMode(mode,featureId);
  }

  onSearchDrawCreated(event: any): any { return this.m_oEngine.onSearchDrawCreated(event); }
  zoomOnBounds(bounds: any, map?: any): boolean { return this.m_oEngine.zoomOnBounds(bounds, map); }
  addRectangleByBoundsArrayOnMap(product: any, color: string, indexLayers: number): any {
    return this.m_oEngine.addRectangleByBoundsArrayOnMap(product, color, indexLayers);
  }
  removeLayerFromMap(layer: any): boolean { return this.m_oEngine.removeLayerFromMap(layer); }
  addLayerMap2DByServer(layerId: string, server: string): boolean {
    return this.m_oEngine.addLayerMap2DByServer(layerId, server);
  }
  removeLayerMap2DByServer(layerId: string): boolean {
    return this.m_oEngine.removeLayerMap2DByServer(layerId);
  }
  setLayerMap2DOpacity(layerId: string, opacity: number): boolean {
    return this.m_oEngine.setLayerMap2DOpacity(layerId, opacity);
  }
  addAllWorkspaceRectanglesOnMap(products: any[], color: string): boolean {
    return this.m_oEngine.addAllWorkspaceRectanglesOnMap(products, color);
  }
  flyToWorkspaceBoundingBox(products: any[]): boolean {
    return this.m_oEngine.flyToWorkspaceBoundingBox(products);
  }
  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox: any): void {
    this.m_oEngine.zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox);
  }
  getWMSLayerInfoUrl(wmsUrl: string, point: any, layerIdList: string): string {
    return this.m_oEngine.getWMSLayerInfoUrl(wmsUrl, point, layerIdList);
  }
  getFeatureInfo(url: string): any { return this.m_oEngine.getFeatureInfo(url); }
  getActiveLayer(): any { return this.m_oEngine.getActiveLayer(); }
}
