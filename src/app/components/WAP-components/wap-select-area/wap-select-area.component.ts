import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-wap-select-area',
  templateUrl: './wap-select-area.component.html',
  styleUrls: ['./wap-select-area.component.css']
})
export class WapSelectAreaComponent implements OnInit {
  @Input() oMapInput;
  @Output() oMapInputChange = new EventEmitter;

  m_oMapOptions: any;
  m_oLayersControl: any;
  m_oDrawOptions: any;
  m_oDrawnItems: any;
  m_sErrorMessage: string;
  m_bIsValid: boolean;

  constructor(public m_oMapService: MapService, private m_oTranslateService: TranslateService) { }

  ngOnInit(): void {
    this.m_oMapService.setDrawnItems();
    this.m_oMapService.initTilelayer();
    
    this.m_oMapOptions = this.m_oMapService.m_oOptions;
    this.m_oLayersControl = this.m_oMapService.m_oLayersControl;
    this.m_oDrawOptions = this.m_oMapService.m_oDrawOptions;
    this.m_oDrawnItems = this.m_oMapService.m_oDrawnItems;

    this.m_oDrawOptions.edit.featureGroup = this.m_oDrawnItems;

    this.m_sErrorMessage = "Error:"
    this.m_bIsValid = true;
  }

  onDrawCreated(event) {
    //Add layer to map
    this.m_oDrawnItems.addLayer(event.layer)

    //on draw created -> need to check area 
    this.checkArea(event.layer)

    //If not valid after check
    if (!this.m_bIsValid) {
      //set layer color
      event.layer.options.color = "#FF0000"

      console.log(this.m_sErrorMessage)
      //Add Confirmation dialog before removal
      // if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      //   this.m_oDrawnItems.clearLayers();
      // }
      return false;
    }
    //If valid after check: 
    this.oMapInput.oBoundingBox.northEast = event.layer._bounds._northEast;
    this.oMapInput.oBoundingBox.southWest = event.layer._bounds._southWest;
    this.oMapInputChange.emit(this.oMapInput);
    return true
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

    let latlngs = layer.getLatLngs();
    // height and width respectively
    let oSide: number[] = [this.getDistance(latlngs[0][0], latlngs[0][1]), this.getDistance(latlngs[0][1], latlngs[0][2])];


    let fMaxSide = Math.max(...oSide);

    let fRatio = Math.max(...oSide) / Math.min(...oSide);

    // first element is the array itself to be passed
    let fArea = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 1000000;

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
}
