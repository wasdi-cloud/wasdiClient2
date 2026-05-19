import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import maplibregl from 'maplibre-gl';
import { IMapEngine } from './map-engine.interface';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ManualBoundingBoxComponent } from 'src/app/shared/shared-components/manual-bounding-box/manual-bounding-box.component';

/**
 * MapLibre implementation used by the map engine selector.
 */
@Injectable({
  providedIn: 'root'
})
export class MapLibreMapEngineAdapter implements IMapEngine {
  private m_oMap: any = null;
  private m_oActiveLayer: any = null;
  private m_bDrawMode = false;
  private m_oDrawStartLngLat: any = null;
  private m_oManualBoundingBoxSubscription = new BehaviorSubject<any>(null);
  private m_oSelectedRectangleSubscription = new BehaviorSubject<any>(null);
  private m_oManualBboxInput: any = null;

  private readonly m_aoBaseLayers = [
    {
      id: 'standard',
      label: 'Standard',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    {
      id: 'topo',
      label: 'Topo',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    },
    {
      id: 'esri-street',
      label: 'Esri Street',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    },
    {
      id: 'esri-imagery',
      label: 'Esri Imagery',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    },
    {
      id: 'arcgis-dark',
      label: 'ArcGIS Dark',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    }
  ];

  constructor(
    private readonly m_oHttp: HttpClient,
    private readonly m_oDialog: MatDialog,
    private readonly m_oNgZone: NgZone
  ) {}

  private readonly m_oDefaultStyle: any = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [this.m_aoBaseLayers[0].url],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }
    ]
  };

  private isMapLibreMap(oMap: any): boolean {
    return !!oMap && typeof oMap.addSource === 'function' && typeof oMap.getStyle === 'function';
  }

  private getMapLibreMap(): any {
    if (this.isMapLibreMap(this.m_oMap)) {
      return this.m_oMap;
    }
    return null;
  }

  private normalizeBoundsToLngLat(aBounds: any): [[number, number], [number, number]] | null {
    const aoPairs: Array<[number, number]> = [];

    const addPair = (aValue: any) => {
      if (!Array.isArray(aValue) || aValue.length < 2) {
        return;
      }
      const fLat = Number(aValue[0]);
      const fLng = Number(aValue[1]);
      if (isNaN(fLat) || isNaN(fLng)) {
        return;
      }
      aoPairs.push([fLat, fLng]);
    };

    const walk = (aValue: any) => {
      if (!Array.isArray(aValue)) {
        return;
      }

      if (aValue.length >= 2 && typeof aValue[0] !== 'object' && typeof aValue[1] !== 'object') {
        addPair(aValue);
        return;
      }

      for (const oItem of aValue) {
        walk(oItem);
      }
    };

    walk(aBounds);

    if (aoPairs.length === 0) {
      return null;
    }

    let fMinLat = aoPairs[0][0];
    let fMaxLat = aoPairs[0][0];
    let fMinLng = aoPairs[0][1];
    let fMaxLng = aoPairs[0][1];

    for (const aPair of aoPairs) {
      if (aPair[0] < fMinLat) fMinLat = aPair[0];
      if (aPair[0] > fMaxLat) fMaxLat = aPair[0];
      if (aPair[1] < fMinLng) fMinLng = aPair[1];
      if (aPair[1] > fMaxLng) fMaxLng = aPair[1];
    }

    return [[fMinLng, fMinLat], [fMaxLng, fMaxLat]];
  }

  private sanitizeId(sInput: string): string {
    return (sInput || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private bboxToLatLngPairs(sBbox: string): Array<[number, number]> {
    const aoValues = sBbox.split(',');
    const aoPairs: Array<[number, number]> = [];
    for (let iIndex = 0; iIndex < aoValues.length - 1; iIndex += 2) {
      const fLat = Number(aoValues[iIndex]);
      const fLng = Number(aoValues[iIndex + 1]);
      if (!isNaN(fLat) && !isNaN(fLng)) {
        aoPairs.push([fLat, fLng]);
      }
    }
    return aoPairs;
  }

  private removeMapLibreLayerByBaseId(sBaseId: string): void {
    const oMap = this.getMapLibreMap();
    if (!oMap) {
      return;
    }

    const sFillLayerId = `${sBaseId}-fill`;
    const sLineLayerId = `${sBaseId}-line`;
    const sSourceId = `${sBaseId}-source`;

    if (oMap.getLayer(sFillLayerId)) oMap.removeLayer(sFillLayerId);
    if (oMap.getLayer(sLineLayerId)) oMap.removeLayer(sLineLayerId);
    if (oMap.getSource(sSourceId)) oMap.removeSource(sSourceId);
  }

  private formatBoundsToLayer(fWest: number, fSouth: number, fEast: number, fNorth: number): any {
    const aoLatLngs = [
      { lat: fNorth, lng: fWest },
      { lat: fNorth, lng: fEast },
      { lat: fSouth, lng: fEast },
      { lat: fSouth, lng: fWest },
      { lat: fNorth, lng: fWest }
    ];

    const oNorthEast = { lat: fNorth, lng: fEast };
    const oSouthWest = { lat: fSouth, lng: fWest };

    return {
      _bounds: {
        _northEast: oNorthEast,
        _southWest: oSouthWest
      },
      _latlngs: [aoLatLngs],
      getBounds: () => ({
        getNorthEast: () => oNorthEast,
        getSouthWest: () => oSouthWest
      }),
      getLatLngs: () => [aoLatLngs],
      toGeoJSON: () => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [fWest, fNorth],
            [fEast, fNorth],
            [fEast, fSouth],
            [fWest, fSouth],
            [fWest, fNorth]
          ]]
        },
        properties: {}
      })
    };
  }

  private upsertSelectionRectangle(fWest: number, fSouth: number, fEast: number, fNorth: number): void {
    const oMap = this.getMapLibreMap();
    if (!oMap) {
      return;
    }

    const sSourceId = 'search-selection-source';
    const sFillLayerId = 'search-selection-fill';
    const sLineLayerId = 'search-selection-line';

    const oFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [fWest, fNorth],
          [fEast, fNorth],
          [fEast, fSouth],
          [fWest, fSouth],
          [fWest, fNorth]
        ]]
      },
      properties: {}
    };

    if (!oMap.getSource(sSourceId)) {
      oMap.addSource(sSourceId, {
        type: 'geojson',
        data: oFeature
      });
      oMap.addLayer({
        id: sFillLayerId,
        type: 'fill',
        source: sSourceId,
        paint: {
          'fill-color': '#4AFF00',
          'fill-opacity': 0.2
        }
      });
      oMap.addLayer({
        id: sLineLayerId,
        type: 'line',
        source: sSourceId,
        paint: {
          'line-color': '#4AFF00',
          'line-width': 2
        }
      });
      return;
    }

    const oSource: any = oMap.getSource(sSourceId);
    oSource.setData(oFeature);
  }

  private setBaseLayerByUrl(sUrl: string): void {
    const oMap = this.getMapLibreMap();
    if (!oMap) {
      return;
    }

    const oStyle = oMap.getStyle();
    const oSource = oStyle?.sources?.osm;
    if (oSource && Array.isArray(oSource.tiles) && oSource.tiles[0] === sUrl) {
      this.m_oActiveLayer = { _url: sUrl };
      return;
    }

    oMap.setStyle({
      ...this.m_oDefaultStyle,
      sources: {
        ...this.m_oDefaultStyle.sources,
        osm: {
          ...(this.m_oDefaultStyle.sources as any).osm,
          tiles: [sUrl]
        }
      }
    });

    this.m_oActiveLayer = { _url: sUrl };
  }

  private createIconControl(sTitle: string, sIcon: string, fOnClick: () => void): any {
    const oController = this;
    return {
      onAdd() {
        const oContainer = document.createElement('div');
        oContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group';

        const oButton = document.createElement('button');
        oButton.type = 'button';
        oButton.title = sTitle;
        oButton.className = 'maplibregl-ctrl-icon';
        oButton.style.display = 'flex';
        oButton.style.alignItems = 'center';
        oButton.style.justifyContent = 'center';
        oButton.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;line-height:1;">${sIcon}</span>`;
        oButton.onclick = (oEvent) => {
          oEvent.preventDefault();
          oEvent.stopPropagation();
          fOnClick();
        };

        oContainer.appendChild(oButton);
        return oContainer;
      },
      onRemove() {
        return;
      }
    };
  }

  private addBaseLayerControl(): void {
    const oMap = this.getMapLibreMap();
    if (!oMap) {
      return;
    }

    const oController = this;
    const oBaseControl = {
      onAdd() {
        const oContainer = document.createElement('div');
        oContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group';

        const oSelect = document.createElement('select');
        oSelect.style.height = '28px';
        oSelect.style.margin = '2px';
        oSelect.style.border = 'none';
        oSelect.style.background = 'white';
        oSelect.style.fontSize = '12px';
        oSelect.style.color = '#283140';
        oSelect.style.minWidth = '170px';
        oSelect.style.paddingRight = '34px';

        for (const oLayer of oController.m_aoBaseLayers) {
          const oOption = document.createElement('option');
          oOption.value = oLayer.url;
          oOption.innerText = oLayer.label;
          oOption.style.color = '#283140';
          oOption.style.backgroundColor = '#FFFFFF';
          oSelect.appendChild(oOption);
        }

        oSelect.onchange = () => {
          oController.setBaseLayerByUrl(oSelect.value);
        };

        oContainer.appendChild(oSelect);
        return oContainer;
      },
      onRemove() {
        return;
      }
    };

    oMap.addControl(oBaseControl as any, 'bottom-right');
  }

  getOptions(): any { return {}; }
  getDrawOptions(): any { return { edit: { featureGroup: null } }; }
  getDrawnItemsLayer(): any { return null; }
  getLayersControl(): any { return null; }

  getManualBoundingBox$(): Observable<any> { return this.m_oManualBoundingBoxSubscription.asObservable(); }
  getSelectedRectangle$(): Observable<any> { return this.m_oSelectedRectangleSubscription.asObservable(); }
  emitSelectedRectangle(event: any): void { this.m_oSelectedRectangleSubscription.next(event); }

  setMap(map: any): void {
    this.m_oMap = map;
  }

  getMap(): any {
    return this.m_oMap;
  }

  initMapSingleton(mapDivId: string): any {
    this.initMap(mapDivId);
    return this.getMap();
  }

  initMap(mapDivId: string): void {
    const oContainer = document.getElementById(mapDivId);
    if (!oContainer) {
      this.m_oMap = null;
      return;
    }

    oContainer.classList.add('wasdi-maplibre-theme');

    this.clearMap();

    this.m_oMap = new maplibregl.Map({
      container: mapDivId,
      style: this.m_oDefaultStyle,
      center: [0, 0],
      zoom: 2,
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      keyboard: true
    });

    this.m_oMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    this.m_oMap.addControl(new maplibregl.FullscreenControl(), 'top-left');
    this.addBaseLayerControl();
    this.m_oActiveLayer = { _url: this.m_aoBaseLayers[0].url };
  }

  clearMap(): void {
    if (this.isMapLibreMap(this.m_oMap)) {
      const oMap = this.m_oMap;
      this.m_oMap = null;

      try {
        oMap.remove();
      } catch (oError) {
        const oContainer = typeof oMap?.getContainer === 'function' ? oMap.getContainer() : null;
        if (oContainer && typeof oContainer.innerHTML === 'string') {
          oContainer.innerHTML = '';
        }
      }
    }
  }

  resetDrawnItemsLayer(): void {
    return;
  }

  addMousePositionAndScale(map: any): void {
    return;
  }

  initGeocoder(map: any): void {
    if (!this.isMapLibreMap(map)) {
      return;
    }

    const oController = this;
    const oSearchControl = {
      onAdd() {
        const oContainer = document.createElement('div');
        oContainer.className = 'maplibregl-ctrl maplibregl-ctrl-group maplibre-search-control';

        const oInput = document.createElement('input');
        oInput.type = 'text';
        oInput.placeholder = 'Search place';

        const oButton = document.createElement('button');
        oButton.type = 'button';
        oButton.title = 'Search';
        oButton.className = 'maplibregl-ctrl-icon maplibre-search-button';
        oButton.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;line-height:18px;">search</span>';

        const fSearch = async () => {
          const sQuery = (oInput.value || '').trim();
          if (!sQuery) {
            return;
          }
          try {
            const sUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sQuery)}&limit=1`;
            const oResponse = await fetch(sUrl);
            const aoResult = await oResponse.json();
            if (Array.isArray(aoResult) && aoResult.length > 0) {
              const fLat = Number(aoResult[0].lat);
              const fLon = Number(aoResult[0].lon);
              map.flyTo({ center: [fLon, fLat], zoom: 8 });
            }
          } catch (oError) {
            return;
          }
        };

        oButton.onclick = (oEvent) => {
          oEvent.preventDefault();
          oEvent.stopPropagation();
          fSearch();
        };

        oInput.onkeydown = (oEvent) => {
          if (oEvent.key === 'Enter') {
            fSearch();
          }
        };

        oContainer.appendChild(oInput);
        oContainer.appendChild(oButton);

        oContainer.onmouseenter = () => oContainer.classList.add('maplibre-search-expanded');
        oContainer.onmouseleave = () => {
          if (document.activeElement !== oInput) {
            oContainer.classList.remove('maplibre-search-expanded');
          }
        };
        oInput.onfocus = () => oContainer.classList.add('maplibre-search-expanded');
        oInput.onblur = () => {
          window.setTimeout(() => {
            if (document.activeElement !== oInput && document.activeElement !== oButton) {
              oContainer.classList.remove('maplibre-search-expanded');
            }
          }, 0);
        };

        return oContainer;
      },
      onRemove() {
        return;
      }
    };

    map.addControl(oSearchControl as any, 'top-right');
  }

  addManualBoundingBoxControl(map: any): void {
    if (!this.isMapLibreMap(map)) {
      return;
    }

    const oController = this;

    const oManualControl = this.createIconControl('Manual Bounding Box', 'pin_invoke', () => {
      const oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent, {
        data: { input: oController.m_oManualBboxInput },
        height: '420px',
        width: '600px'
      });

      oDialog.afterClosed().subscribe(oResult => {
        oController.setManualResult(oResult);

        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
          if (isNaN(oResult.north) || isNaN(oResult.south) || isNaN(oResult.east) || isNaN(oResult.west)) {
            return;
          }

          const fNorth = parseFloat(oResult.north);
          const fSouth = parseFloat(oResult.south);
          const fEast = parseFloat(oResult.east);
          const fWest = parseFloat(oResult.west);
          const fMinLng = Math.min(fWest, fEast);
          const fMaxLng = Math.max(fWest, fEast);
          const fMinLat = Math.min(fSouth, fNorth);
          const fMaxLat = Math.max(fSouth, fNorth);

          oController.upsertSelectionRectangle(fMinLng, fMinLat, fMaxLng, fMaxLat);
          map.fitBounds([[fMinLng, fMinLat], [fMaxLng, fMaxLat]], { padding: 30, duration: 700 });
          oController.m_oManualBoundingBoxSubscription.next(oController.formatBoundsToLayer(fMinLng, fMinLat, fMaxLng, fMaxLat));
        }
      });
    });

    const oDrawControl = this.createIconControl('Draw Rectangle', 'crop_square', () => {
      oController.m_bDrawMode = !oController.m_bDrawMode;
      oController.m_oDrawStartLngLat = null;
      map.getCanvas().style.cursor = oController.m_bDrawMode ? 'crosshair' : '';
    });

    map.addControl(oManualControl as any, 'top-right');
    map.addControl(oDrawControl as any, 'top-right');

    const fOnMouseDown = (oEvent: any) => {
      if (!oController.m_bDrawMode) {
        return;
      }
      oController.m_oDrawStartLngLat = oEvent.lngLat;
      map.dragPan.disable();
    };

    const fOnMouseMove = (oEvent: any) => {
      if (!oController.m_bDrawMode || !oController.m_oDrawStartLngLat) {
        return;
      }

      const fMinLng = Math.min(oController.m_oDrawStartLngLat.lng, oEvent.lngLat.lng);
      const fMaxLng = Math.max(oController.m_oDrawStartLngLat.lng, oEvent.lngLat.lng);
      const fMinLat = Math.min(oController.m_oDrawStartLngLat.lat, oEvent.lngLat.lat);
      const fMaxLat = Math.max(oController.m_oDrawStartLngLat.lat, oEvent.lngLat.lat);
      oController.upsertSelectionRectangle(fMinLng, fMinLat, fMaxLng, fMaxLat);
    };

    const fOnMouseUp = (oEvent: any) => {
      if (!oController.m_bDrawMode || !oController.m_oDrawStartLngLat) {
        return;
      }

      const fMinLng = Math.min(oController.m_oDrawStartLngLat.lng, oEvent.lngLat.lng);
      const fMaxLng = Math.max(oController.m_oDrawStartLngLat.lng, oEvent.lngLat.lng);
      const fMinLat = Math.min(oController.m_oDrawStartLngLat.lat, oEvent.lngLat.lat);
      const fMaxLat = Math.max(oController.m_oDrawStartLngLat.lat, oEvent.lngLat.lat);

      oController.upsertSelectionRectangle(fMinLng, fMinLat, fMaxLng, fMaxLat);
      oController.m_oManualBoundingBoxSubscription.next(oController.formatBoundsToLayer(fMinLng, fMinLat, fMaxLng, fMaxLat));

      oController.m_oDrawStartLngLat = null;
      oController.m_bDrawMode = false;
      map.getCanvas().style.cursor = '';
      map.dragPan.enable();
    };

    map.on('mousedown', fOnMouseDown);
    map.on('mousemove', fOnMouseMove);
    map.on('mouseup', fOnMouseUp);
  }

  onSearchDrawCreated(event: any): any { return event; }

  zoomOnBounds(bounds: any, map?: any): boolean {
    const oMap = map && this.isMapLibreMap(map) ? map : this.getMapLibreMap();
    if (!this.isMapLibreMap(oMap)) {
      return false;
    }

    const aLngLatBounds = this.normalizeBoundsToLngLat(bounds);
    if (!aLngLatBounds) {
      return false;
    }

    oMap.fitBounds(aLngLatBounds as any, { padding: 70, duration: 700, maxZoom: 9 });
    return true;
  }

  addRectangleByBoundsArrayOnMap(product: any, color: string, indexLayers: number): any {
    const oMap = this.getMapLibreMap();
    if (!this.isMapLibreMap(oMap) || !product || !Array.isArray(product.bounds)) {
      return null;
    }

    const sColor = color || '#ff7800';
    const sBaseId = `ws-rect-${this.sanitizeId(product.id || product.fileName || `${Date.now()}`)}`;
    this.removeMapLibreLayerByBaseId(sBaseId);

    const aoCoordinates = product.bounds.map((aPoint: any) => [Number(aPoint[1]), Number(aPoint[0])]);
    if (aoCoordinates.length > 0) {
      const aFirst = aoCoordinates[0];
      const aLast = aoCoordinates[aoCoordinates.length - 1];
      if (aFirst[0] !== aLast[0] || aFirst[1] !== aLast[1]) {
        aoCoordinates.push([aFirst[0], aFirst[1]]);
      }
    }

    const sSourceId = `${sBaseId}-source`;
    const sFillLayerId = `${sBaseId}-fill`;
    const sLineLayerId = `${sBaseId}-line`;
    oMap.addSource(sSourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [aoCoordinates]
        },
        properties: {}
      }
    });

    oMap.addLayer({
      id: sFillLayerId,
      type: 'fill',
      source: sSourceId,
      paint: {
        'fill-color': sColor,
        'fill-opacity': 0.2
      }
    });

    oMap.addLayer({
      id: sLineLayerId,
      type: 'line',
      source: sSourceId,
      paint: {
        'line-color': sColor,
        'line-width': 1
      }
    });

    const aBounds = this.normalizeBoundsToLngLat(product.bounds);
    let oRectangleLike: any = null;

    const fApplyHoverStyle = (bIsHovering: boolean) => {
      if (!this.isMapLibreMap(oMap)) {
        return;
      }

      if (oMap.getLayer(sFillLayerId)) {
        oMap.setPaintProperty(sFillLayerId, 'fill-opacity', bIsHovering ? 0.7 : 0.2);
      }

      if (oMap.getLayer(sLineLayerId)) {
        oMap.setPaintProperty(sLineLayerId, 'line-width', bIsHovering ? 3 : 1);
      }
    };

    const fEmitSelectedRectangle = (sAction: string, bIsHovering?: boolean) => {
      this.m_oNgZone.run(() => {
        this.emitSelectedRectangle({
          action: sAction,
          product,
          isHovering: bIsHovering
        });
      });
    };

    const fSetHoverState = (bIsHovering: boolean) => {
      if (oRectangleLike.__wasdiMapLibreHoverActive === bIsHovering) {
        return;
      }

      this.m_oNgZone.run(() => {
        oRectangleLike.__wasdiMapLibreHoverActive = bIsHovering;
        if (typeof product === 'object' && product !== null) {
          product.isHovering = bIsHovering;
        }
      });

      fApplyHoverStyle(bIsHovering);
      fEmitSelectedRectangle('mouse-move', bIsHovering);
    };

    const fOnMouseEnter = () => fSetHoverState(true);
    const fOnMouseLeave = () => fSetHoverState(false);
    const fOnClick = () => fEmitSelectedRectangle('click');

    oMap.on('mouseenter', sFillLayerId, fOnMouseEnter);
    oMap.on('mouseleave', sFillLayerId, fOnMouseLeave);
    oMap.on('click', sFillLayerId, fOnClick);
    oMap.on('mouseenter', sLineLayerId, fOnMouseEnter);
    oMap.on('mouseleave', sLineLayerId, fOnMouseLeave);
    oMap.on('click', sLineLayerId, fOnClick);

    oRectangleLike = {
      __wasdiMapLibreLayerId: sBaseId,
      __wasdiMapLibreFillLayerId: sFillLayerId,
      __wasdiMapLibreLineLayerId: sLineLayerId,
      __wasdiMapLibreHoverActive: false,
      __wasdiMapLibreHandlers: [
        { type: 'mouseenter', layerId: sFillLayerId, handler: fOnMouseEnter },
        { type: 'mouseleave', layerId: sFillLayerId, handler: fOnMouseLeave },
        { type: 'click', layerId: sFillLayerId, handler: fOnClick },
        { type: 'mouseenter', layerId: sLineLayerId, handler: fOnMouseEnter },
        { type: 'mouseleave', layerId: sLineLayerId, handler: fOnMouseLeave },
        { type: 'click', layerId: sLineLayerId, handler: fOnClick }
      ],
      _rawPxBounds: {},
      getBounds: () => {
        const aB = aBounds || [[0, 0], [0, 0]];
        return {
          getNorthEast: () => ({ lat: aB[1][1], lng: aB[1][0] }),
          getSouthWest: () => ({ lat: aB[0][1], lng: aB[0][0] })
        };
      },
      setStyle: (oStyle: any) => {
        if (!oStyle) {
          return;
        }

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oStyle.fillOpacity) && oMap.getLayer(sFillLayerId)) {
          oMap.setPaintProperty(sFillLayerId, 'fill-opacity', oStyle.fillOpacity);
        }

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oStyle.weight) && oMap.getLayer(sLineLayerId)) {
          oMap.setPaintProperty(sLineLayerId, 'line-width', oStyle.weight);
        }
      },
      removeFrom: (_oMap: any) => {
        this.removeLayerFromMap(oRectangleLike);
        return oRectangleLike;
      }
    };

    return oRectangleLike;
  }

  removeLayerFromMap(layer: any): boolean {
    const oMap = this.getMapLibreMap();
    if (!this.isMapLibreMap(oMap)) {
      return false;
    }

    if (!layer || !layer.__wasdiMapLibreLayerId) {
      return false;
    }

    if (Array.isArray(layer.__wasdiMapLibreHandlers)) {
      for (const oBinding of layer.__wasdiMapLibreHandlers) {
        try {
          oMap.off(oBinding.type, oBinding.layerId, oBinding.handler);
        } catch (_oError) {
          // The layer may already be gone; detach best-effort only.
        }
      }
    }

    this.removeMapLibreLayerByBaseId(layer.__wasdiMapLibreLayerId);
    return true;
  }

  addLayerMap2DByServer(layerId: string, server: string): boolean {
    const oMap = this.getMapLibreMap();
    if (!this.isMapLibreMap(oMap)) {
      return false;
    }

    if (!layerId || !server) {
      return false;
    }

    const sSanitizedLayerId = this.sanitizeId(layerId);
    const sSourceId = `wms-${sSanitizedLayerId}-source`;
    const sMapLayerId = `wms-${sSanitizedLayerId}-layer`;

    if (oMap.getLayer(sMapLayerId)) {
      oMap.removeLayer(sMapLayerId);
    }
    if (oMap.getSource(sSourceId)) {
      oMap.removeSource(sSourceId);
    }

    const sSeparator = server.includes('?') ? '&' : '?';
    const sTileUrl = `${server}${sSeparator}service=WMS&request=GetMap&version=1.1.1&layers=${encodeURIComponent(layerId)}&styles=&format=image/png&transparent=true&srs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256`;

    oMap.addSource(sSourceId, {
      type: 'raster',
      tiles: [sTileUrl],
      tileSize: 256
    });

    oMap.addLayer({
      id: sMapLayerId,
      type: 'raster',
      source: sSourceId,
      paint: {
        'raster-opacity': 1
      }
    });

    return true;
  }

  addAllWorkspaceRectanglesOnMap(products: any[], color: string): boolean {
    if (!Array.isArray(products)) {
      return false;
    }

    for (const oProduct of products) {
      if (!oProduct) {
        continue;
      }

      if (!oProduct.bounds && oProduct.bbox) {
        oProduct.bounds = this.bboxToLatLngPairs(oProduct.bbox);
      }

      if (Array.isArray(oProduct.bounds) && oProduct.bounds.length > 0) {
        oProduct.rectangle = this.addRectangleByBoundsArrayOnMap(oProduct, color || '#ff7800', 0);
      }
    }

    return true;
  }

  flyToWorkspaceBoundingBox(products: any[]): boolean {
    if (!Array.isArray(products) || products.length === 0) {
      return false;
    }

    const aoBounds: any[] = [];
    for (const oProduct of products) {
      if (oProduct?.bounds?.length) {
        aoBounds.push(oProduct.bounds);
      } else if (oProduct?.bbox) {
        aoBounds.push(this.bboxToLatLngPairs(oProduct.bbox));
      }
    }

    return this.zoomOnBounds(aoBounds);
  }

  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox: any): void {
    const oMap = this.getMapLibreMap();
    if (!this.isMapLibreMap(oMap)) {
      return;
    }

    if (!geoserverBoundingBox) {
      return;
    }

    let oBounds = geoserverBoundingBox;
    if (typeof geoserverBoundingBox === 'string') {
      oBounds = JSON.parse(geoserverBoundingBox.replace(/\n/g, ''));
    }

    oMap.fitBounds([[oBounds.minx, oBounds.miny], [oBounds.maxx, oBounds.maxy]], {
      padding: 70,
      duration: 700,
      maxZoom: 9
    });
  }

  getWMSLayerInfoUrl(wmsUrl: string, point: any, layerIdList: string): string {
    const oLat = Number(point?.lat);
    const oLng = Number(point?.lng);

    if (!wmsUrl || isNaN(oLat) || isNaN(oLng) || !layerIdList) {
      return '';
    }

    const fSouth = oLat - 0.0001;
    const fWest = oLng - 0.0001;
    const fNorth = oLat + 0.0001;
    const fEast = oLng + 0.0001;
    const oWmsParams: Record<string, string | number> = {
      request: 'GetFeatureInfo',
      service: 'WMS',
      info_format: 'application/json',
      query_layers: layerIdList,
      feature_count: 10,
      version: '1.3.0',
      bbox: [fSouth, fWest, fNorth, fEast].join(','),
      layers: layerIdList,
      height: 101,
      width: 101,
      i: 50,
      j: 50,
      crs: 'EPSG:4326'
    };

    const oSearchParams = new URLSearchParams();
    Object.entries(oWmsParams).forEach(([sKey, oValue]) => oSearchParams.set(sKey, String(oValue)));
    const sSeparator = wmsUrl.includes('?') ? '&' : '?';
    return `${wmsUrl}${sSeparator}${oSearchParams.toString()}`;
  }

  getFeatureInfo(url: string): any {
    const aoHeaders = new HttpHeaders()
      .set('Accept', 'text/html,application/xhtml+xml,application/xml')
      .set('Cache-Control', 'max-age=0');
    return this.m_oHttp.get(url, { headers: aoHeaders });
  }

  getActiveLayer(): any {
    return this.m_oActiveLayer;
  }

  setManualResult(oBboxResult: any): void {
    this.m_oManualBboxInput = oBboxResult;
  }
}
