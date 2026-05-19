import { Component, EventEmitter, Input, OnInit, AfterViewInit, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MapEngineService } from 'src/app/services/map-engine/map-engine.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-search-map',
    templateUrl: './search-map.component.html',
    styleUrls: ['./search-map.component.css'],
    standalone: false
})
export class SearchMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() m_aoProducts: Observable<any>;
  m_aoProductsList: any;
  @Input() oMapInput: any = {
    maxArea: 0,
    maxRatioSide: 0,
    maxSide: 0,
    oBoundingBox: {
      northEast: '',
      southWest: ''
    }
  };
  @Output() m_oMapInputChange = new EventEmitter;

  m_sErrorMessage: string;
  m_bIsValid: boolean = true;

  private m_oManualBboxSubscription: Subscription;

  constructor(
    private m_oMapEngine: MapEngineService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {
    this.m_sErrorMessage = 'Error:';
    this.m_bIsValid = true;
  }

  ngAfterViewInit(): void {
    this.m_oMapEngine.initMap('wasdiMapImport');
    const oMap = this.m_oMapEngine.getMap();
    if (oMap) {
      this.m_oMapEngine.initGeocoder(oMap);
      this.m_oMapEngine.addManualBoundingBoxControl(oMap);
      this.m_oMapEngine.addMousePositionAndScale(oMap);
      // Issue 1 (invalidateSize equivalent): resize after DOM layout settles
      setTimeout(() => oMap.resize(), 100);
    }

    this.m_oManualBboxSubscription = this.m_oMapEngine.getManualBoundingBox$().subscribe(oResult => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
        if (!this.checkAreaFromBounds(oResult)) {
          return;
        }
        this.formatManualBbox(oResult);
      }
    });
  }

  ngOnDestroy(): void {
    FadeoutUtils.verboseLog('SearchMapComponent.ngOnDestroy');
    if (this.m_oManualBboxSubscription) {
      this.m_oManualBboxSubscription.unsubscribe();
    }
    this.m_oMapEngine.clearMap();
  }

  private haversineDistanceKm(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}): number {
    const R = 6371;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  checkAreaFromBounds(oLayer: any): boolean {
    if (!oLayer || !Array.isArray(oLayer._latlngs) || !Array.isArray(oLayer._latlngs[0])) {
      return true;
    }
    const aoPoints = oLayer._latlngs[0];
    if (aoPoints.length < 3) {
      return true;
    }
    // Points from formatBoundsToLayer: [NW, NE, SE, SW, NW(close)]
    const fWidth = this.haversineDistanceKm(aoPoints[0], aoPoints[1]);
    const fHeight = this.haversineDistanceKm(aoPoints[1], aoPoints[2]);
    const fArea = fWidth * fHeight;
    const fMaxSide = Math.max(fWidth, fHeight);
    const fMinSide = Math.min(fWidth, fHeight);
    const fRatio = fMinSide > 0 ? fMaxSide / fMinSide : 0;

    this.m_bIsValid = true;
    if (this.oMapInput.maxArea !== 0 && fArea > this.oMapInput.maxArea) {
      this.m_bIsValid = false;
    }
    if (this.oMapInput.maxSide !== 0 && fMaxSide > this.oMapInput.maxSide) {
      this.m_bIsValid = false;
    }
    if (this.oMapInput.maxRatioSide !== 0 && fRatio > this.oMapInput.maxRatioSide) {
      this.m_bIsValid = false;
    }
    return this.m_bIsValid;
  }

  zoomOnBounds(oRectangle: any) {
    const oBounds = oRectangle.getBounds();
    const oNorthEast = oBounds.getNorthEast();
    const oSouthWest = oBounds.getSouthWest();

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oNorthEast) || FadeoutUtils.utilsIsObjectNullOrUndefined(oSouthWest)) {
      console.log('Error in zoom on bounds');
    } else {
      const aaBounds = [[oNorthEast.lat, oNorthEast.lng], [oSouthWest.lat, oSouthWest.lng]];
      if (this.m_oMapEngine.zoomOnBounds(aaBounds) === false) {
        console.log('Error in zoom on bounds');
      }
    }
  }

  formatManualBbox(oLayer: any) {
    let sFilter = '( footprint:"intersects(POLYGON((';
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer)) {
      const aaLatLngs = oLayer._latlngs[0];
      const iNumberOfPoints = aaLatLngs.length;
      const iLastlat = aaLatLngs[0].lat;
      const iLastlng = aaLatLngs[0].lng;
      for (let iIndex = 0; iIndex < iNumberOfPoints; iIndex++) {
        sFilter += aaLatLngs[iIndex].lng + ' ' + aaLatLngs[iIndex].lat + ',';
      }
      sFilter += iLastlng + ' ' + iLastlat + ')))" )';
    }
    this.oMapInput = sFilter;
    this.m_oMapInputChange.emit(this.oMapInput);
  }
}
