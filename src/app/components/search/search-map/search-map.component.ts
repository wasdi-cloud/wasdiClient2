import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from 'src/app/services/map.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Observable } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-search-map',
  templateUrl: './search-map.component.html',
  styleUrls: ['./search-map.component.css']
})
export class SearchMapComponent implements OnInit, OnDestroy, AfterViewChecked {
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

  m_oDrawnItems: any;
  m_oDrawOptions: any;
  m_oLayersControl: any;
  m_sErrorMessage: string;
  m_bIsValid: boolean;
  m_oMapOptions: any;
  m_oManualBboxSubscription: any;
  m_oMap: any;

  constructor(
    public m_oMapService: MapService,
    private m_oTranslate: TranslateService
  ) {
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;
    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;
  }

  ngOnInit(): void {
    this.m_sErrorMessage = "Error:"
    this.m_bIsValid = true;

    this.m_oManualBboxSubscription = this.m_oMapService.m_oManualBoundingBoxSubscription.subscribe(oResult => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
        this.formatManualBbox(oResult);
      }
    })
  }


  ngAfterViewChecked(): void {
    this.m_oMap.invalidateSize();
  }

  ngOnDestroy(): void {
    FadeoutUtils.verboseLog("SearchMapComponent.ngOnDestroy")
    this.m_oMapService.setMap(null);
    this.m_oMapService.setDrawnItems()
  }

  onMapReady(oMap: L.Map) {
    this.m_oMap = oMap;

    this.m_oMapService.setMap(oMap);
    this.m_oMapService.addMousePositionAndScale(oMap);
    L.control.zoom({ position: 'bottomright' }).addTo(oMap);
    this.m_oMapService.m_oLayersControl.addTo(oMap);
    this.m_oMapService.initGeoSearchPluginForOpenStreetMap(oMap);
    this.m_oMapService.addManualBbox(oMap);
  }

  onDrawCreated(oEvent: any) {

    if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      this.m_oDrawnItems.clearLayers();
    }
    let oDrawnItem = this.m_oMapService.onSearchDrawCreated(oEvent);

    //Add layer to map
    //on draw created -> need to check area 
    this.checkArea(oDrawnItem);
    //If not valid after check
    if (!this.m_bIsValid) {
      //set layer color
      oEvent.layer.options.color = "#FF0000"

      //Add Confirmation dialog before removal
      if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
        this.m_oDrawnItems.clearLayers();
      }

      return false;
    }
    //If valid after check format the selected area for call: 
    this.oMapInput = this.formatDrawnItem(oDrawnItem);
    this.m_oMapInputChange.emit(this.oMapInput);
    return true
  }

  formatDrawnItem(oLayer) {
    let sFilter: string = '( footprint:"intersects(POLYGON(('

    //Ensure layer variable is defined: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false) {
      let iNumberOfPoints = oLayer[0].length;
      let aaLatLngs = oLayer[0];
      /*open search want the first point as end point */
      let iLastlat = aaLatLngs[0].lat;
      let iLastlng = aaLatLngs[0].lng;
      for (let iIndexBounds = 0; iIndexBounds < iNumberOfPoints; iIndexBounds++) {

        sFilter = sFilter + aaLatLngs[iIndexBounds].lng + " " + aaLatLngs[iIndexBounds].lat + ",";
        //if(iIndexBounds != (iNumberOfPoints-1))
        //    sFilter = sFilter + ",";
      }
      sFilter = sFilter + iLastlng + " " + iLastlat + ')))" )';
    }
    return sFilter
  }

  getDistance(pointFrom, pointTo) {
    let markerFrom = L.circleMarker(pointFrom, { color: '#4AFF00', radius: 10 });
    let markerTo = L.circleMarker(pointTo, { color: '#4AFF00', radius: 10 });

    let from = markerFrom.getLatLng();
    let to = markerTo.getLatLng();

    let distance = parseInt((from.distanceTo(to)).toFixed(0)) / 1000;

    return distance

  }

  checkArea(layer) {
    /**
     The following happens in this.onDrawCreated():  
      oController.boundingBox.northEast = layer._bounds._northEast;
      oController.boundingBox.southWest = layer._bounds._southWest;
    */

    let latlngs = layer
    // height and width respectively
    let oSide: number[] = [this.getDistance(latlngs[0][0], latlngs[0][1]), this.getDistance(latlngs[0][1], latlngs[0][2])];


    let fMaxSide = Math.max(...oSide);

    let fRatio = Math.max(...oSide) / Math.min(...oSide);

    // first element is the array itself to be passed
    let fArea = L.GeometryUtil.geodesicArea(layer[0]) / 1000000;

    if (fArea > this.oMapInput.maxArea && this.oMapInput.maxArea !== 0) {
      // sErrorMessage = sErrorMessage.concat(this.m_oTranslateService.getTranslation());
      this.m_bIsValid = false;
    }

    if (fMaxSide > this.oMapInput.maxSide && this.oMapInput.maxSide != 0) {
      // sErrorMessage = sErrorMessage.concat($translate.getTranslationTable().WAP_SELECT_AREA_OVER_SIDE);
      this.m_bIsValid = false;
    }

    if (fRatio > this.oMapInput.maxRatioSide && this.oMapInput.maxRatioSide != 0) {
      // sErrorMessage = sErrorMessage.concat($translate.getTranslationTable().WAP_SELECT_AREA_OVER_RATIO);
      this.m_bIsValid = false;
    }

    return this.m_bIsValid;
  }

  zoomOnBounds(oRectangle: any) {
    let oBounds = oRectangle.getBounds();
    let oNorthEast = oBounds.getNorthEast();
    let oSouthWest = oBounds.getSouthWest();

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oNorthEast) || FadeoutUtils.utilsIsObjectNullOrUndefined(oSouthWest)) {
      console.log("Error in zoom on bounds");
    }
    else {
      let aaBounds = [[oNorthEast.lat, oNorthEast.lng], [oSouthWest.lat, oSouthWest.lng]];

      if (this.m_oMapService.zoomOnBounds(aaBounds) == false) {
        console.log("Error in zoom on bounds");
      }
    }
  }

  formatManualBbox(oLayer) {
    let sFilter = '( footprint:"intersects(POLYGON((';
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer)) {
      let iNumberOfPoints = oLayer._latlngs[0].length;
      let aaLatLngs = oLayer._latlngs[0];
      /*open search want the first point as end point */
      let iLastlat = aaLatLngs[0].lat;
      let iLastlng = aaLatLngs[0].lng;
      for (let iIndexBounds = 0; iIndexBounds < iNumberOfPoints; iIndexBounds++) {

        sFilter = sFilter + aaLatLngs[iIndexBounds].lng + " " + aaLatLngs[iIndexBounds].lat + ",";
        //if(iIndexBounds != (iNumberOfPoints-1))
        //    sFilter = sFilter + ",";
      }
      sFilter = sFilter + iLastlng + " " + iLastlat + ')))" )';
    }
    //(%20footprint:%22Intersects(POLYGON((5.972671999999995%2036.232811331264955,20.123062624999992%2036.232811331264955,20.123062624999992%2048.3321995971576,5.972671999999995%2048.3321995971576,5.972671999999995%2036.232811331264955)))%22%20)
    //set filter

    this.oMapInput = sFilter;
    this.m_oMapInputChange.emit(this.oMapInput);
  }
}
