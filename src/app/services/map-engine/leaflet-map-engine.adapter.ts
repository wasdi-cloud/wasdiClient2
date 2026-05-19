import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMapEngine } from './map-engine.interface';
import { MapService } from '../map.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

/**
 * Leaflet implementation adapter that wraps the existing MapService.
 * Used during migration to MapLibre. Once migration is complete, this can be removed.
 */
@Injectable({
  providedIn: 'root'
})
export class LeafletMapEngineAdapter implements IMapEngine {
  private m_oSelectedRectangleSubscription = new BehaviorSubject<any>(null);

  constructor(private m_oMapService: MapService) { }

  getOptions(): any {
    return this.m_oMapService.m_oOptions;
  }

  getDrawOptions(): any {
    return this.m_oMapService.m_oDrawOptions;
  }

  getDrawnItemsLayer(): any {
    return this.m_oMapService.m_oDrawnItems;
  }

  getLayersControl(): any {
    return this.m_oMapService.m_oLayersControl;
  }

  getManualBoundingBox$(): Observable<any> {
    return this.m_oMapService.m_oManualBoundingBoxSubscription.asObservable();
  }

  getSelectedRectangle$(): Observable<any> {
    return this.m_oSelectedRectangleSubscription.asObservable();
  }

  emitSelectedRectangle(event: any): void {
    this.m_oSelectedRectangleSubscription.next(event);
  }

  setMap(map: any): void {
    this.m_oMapService.setMap(map);
  }

  getMap(): any {
    return this.m_oMapService.getMap();
  }

  initMapSingleton(mapDivId: string): any {
    return this.m_oMapService.initMapSingleton(mapDivId);
  }

  initMap(mapDivId: string): void {
    this.m_oMapService.initWasdiMap(mapDivId);
  }

  clearMap(): void {
    this.m_oMapService.clearMap();
  }

  resetDrawnItemsLayer(): void {
    this.m_oMapService.setDrawnItems();
  }

  addMousePositionAndScale(map: any): void {
    this.m_oMapService.addMousePositionAndScale(map);
  }

  initGeocoder(map: any): void {
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(map);
  }

  addManualBoundingBoxControl(map: any): void {
    this.m_oMapService.addManualBbox(map);
  }

  onSearchDrawCreated(event: any): any {
    return this.m_oMapService.onSearchDrawCreated(event);
  }

  zoomOnBounds(bounds: any, map?: any): boolean {
    return this.m_oMapService.zoomOnBounds(bounds);
  }

  addRectangleByBoundsArrayOnMap(product: any, color: string, indexLayers: number): any {
    return this.m_oMapService.addRectangleByBoundsArrayOnMap(product, color, indexLayers);
  }

  removeLayerFromMap(layer: any): boolean {
    return this.m_oMapService.removeLayerFromMap(layer);
  }

  addLayerMap2DByServer(layerId: string, server: string): boolean {
    return this.m_oMapService.addLayerMap2DByServer(layerId, server);
  }

  addAllWorkspaceRectanglesOnMap(products: any[], color: string): boolean {
    return this.m_oMapService.addAllWorkspaceRectanglesOnMap(products, color);
  }

  flyToWorkspaceBoundingBox(products: any[]): boolean {
    return this.m_oMapService.flyToWorkspaceBoundingBox(products);
  }

  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox: any): void {
    this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox);
  }

  getWMSLayerInfoUrl(wmsUrl: string, point: any, layerIdList: string): string {
    return this.m_oMapService.getWMSLayerInfoUrl(wmsUrl, point, layerIdList);
  }

  getFeatureInfo(url: string): any {
    return this.m_oMapService.getFeatureInfo(url);
  }

  getActiveLayer(): any {
    return this.m_oMapService.getActiveLayer();
  }
}
