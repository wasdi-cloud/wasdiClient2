import { Observable } from 'rxjs';

/**
 * Framework-agnostic map engine contract used by UI components.
 *
 * The current implementation is MapLibre-backed.
 */
export interface IMapEngine {
  getOptions(): any;
  getDrawOptions(): any;
  getDrawnItemsLayer(): any;
  getLayersControl(): any;

  getManualBoundingBox$(): Observable<any>;
  getSelectedRectangle$(): Observable<any>;
  emitSelectedRectangle(event: any): void;

  setMap(map: any): void;
  getMap(): any;
  initMapSingleton(mapDivId: string): any;
  initMap(mapDivId: string): void;
  clearMap(): void;
  resetDrawnItemsLayer(): void;

  addMousePositionAndScale(map: any): void;
  initGeocoder(map: any): void;
  addManualBoundingBoxControl(map: any): void;

  onSearchDrawCreated(event: any): any;
  zoomOnBounds(bounds: any, map?: any): boolean;
  addRectangleByBoundsArrayOnMap(product: any, color: string, indexLayers: number): any;
  removeLayerFromMap(layer: any): boolean;
  addLayerMap2DByServer(layerId: string, server: string): boolean;
  addAllWorkspaceRectanglesOnMap(products: any[], color: string): boolean;
  flyToWorkspaceBoundingBox(products: any[]): boolean;
  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox: any): void;
  getWMSLayerInfoUrl(wmsUrl: string, point: any, layerIdList: string): string;
  getFeatureInfo(url: string): any;
  getActiveLayer(): any;
}
