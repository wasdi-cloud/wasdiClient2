import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MapService } from 'src/app/services/map.service';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import * as L from 'leaflet';

@Component({
  selector: 'app-search-map',
  templateUrl: './search-map.component.html',
  styleUrls: ['./search-map.component.css']
})
export class SearchMapComponent implements OnInit {
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
  m_oLayersControl: any;
  m_oDrawOptions: any;
  m_sErrorMessage: string;
  m_bIsValid: boolean;
  m_oMapOptions: any;

  constructor(
    private m_oMapService: MapService,
    private m_oTranslate: TranslateService
  ) { }

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

  onMapReady(map: any) {

  }




  onDrawCreated(oEvent: any) {

    let oDrawnItem = this.m_oMapService.onSearchDrawCreated(oEvent);

    //Add layer to map
    //this.m_oDrawnItems.addLayer(oEvent)

    //on draw created -> need to check area 
    this.checkArea(oDrawnItem);
    //If not valid after check
    if (!this.m_bIsValid) {
      //set layer color
      oEvent.layer.options.color = "#FF0000"

      console.log(this.m_sErrorMessage)
      //Add Confirmation dialog before removal
      if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
        this.m_oDrawnItems.clearLayers();
      }

      return false;
    }
    //If valid after check format the selected area for call: 
    this.oMapInput = this.formatDrawnItemm(oDrawnItem);
    this.m_oMapInputChange.emit(this.oMapInput);
    return true
  }

  onSeachDraCreated(oEvent: any) {

  }

  formatDrawnItemm(oLayer) {
    let sFilter: string = '( footprint:"intersects(POLYGON(('
    console.log(oLayer);
    //Ensure layer variable is defined: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false) {
      var iNumberOfPoints = oLayer[0].length;
      console.log(iNumberOfPoints);
      var aaLatLngs = oLayer[0];
      /*open search want the first point as end point */
      var iLastlat = aaLatLngs[0].lat;
      var iLastlng = aaLatLngs[0].lng;
      for (var iIndexBounds = 0; iIndexBounds < iNumberOfPoints; iIndexBounds++) {

        sFilter = sFilter + aaLatLngs[iIndexBounds].lng + " " + aaLatLngs[iIndexBounds].lat + ",";
        console.log(sFilter);
        //if(iIndexBounds != (iNumberOfPoints-1))
        //    sFilter = sFilter + ",";
      }
      sFilter = sFilter + iLastlng + " " + iLastlat + ')))" )';
    }
    console.log(sFilter);
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

}
