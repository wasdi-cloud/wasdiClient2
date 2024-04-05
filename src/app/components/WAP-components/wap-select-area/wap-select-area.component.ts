import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import { ManualBoundingBoxComponent } from '../../../shared/shared-components/manual-bounding-box/manual-bounding-box.component';
import { faL } from '@fortawesome/free-solid-svg-icons';

declare const L: any;

@Component({
  selector: 'app-wap-select-area',
  templateUrl: './wap-select-area.component.html',
  styleUrls: ['./wap-select-area.component.css']
})

/**
 * WASDI Select Area User Control
 */
export class WapSelectAreaComponent implements OnInit {

  /**
   * Map input as described by the User Interface
   */
  @Input() m_oMapInput;

  /**
   * Event about map changed
   */
  @Output() m_oMapInputChange = new EventEmitter;

  /**
   * Draw Options
   */
  m_oDrawOptions: any;
  /**
   * List of layers drawn by the user (indeed the area of interest)
   */
  m_oDrawnItems: any;
  /**
   * Error message
   */
  m_sErrorMessage: string = "Error:";
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
   * @param m_oMapService 
   * @param m_oTranslateService 
   */
  constructor(public m_oMapService: MapService, private m_oTranslateService: TranslateService, private m_oDialog: MatDialog) 
  { 
    //console.log("Creating WAP Map Component with MapId: " + this.m_sMapId)
  }

  /**
   * Init the component
   */
  ngOnInit(): void {

    // Subscribe to the event that tell us a manual bbox has been drawn
    this.m_aoManualBBoxSubscription = this.m_oMapService.m_oManualBoundingBoxSubscription.subscribe(oResult => {

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {

        this.m_oGeoJSON = oResult.toGeoJSON();
        this.m_sPolygon = this.getPolygon();

        this.m_oMapInputChange.emit({
          geoJSON: this.m_oGeoJSON,
          polygon: this.m_sPolygon
        });
      }
    });

    // Our own reference
    let oController = this;

    // Create our own Drawn Items Layer
    this.m_oDrawnItems = new L.FeatureGroup();    

    // Give time to leaflet and then init
    setTimeout(function () {
      // Create a new map
      let oMap = oController.m_oMapService.initMapSingleton(oController.m_sMapId);
      oController.m_oMap = oMap;
      oMap.addLayer(oController.m_oDrawnItems);
      oController.addManualBbox(oMap);
      oController.addBoundingBoxDrawerOnMap(oMap);  
    }, 500);
  }

  ngOnDestroy(): void {
    //Clear Map 
    if (this.m_oMap) {
      this.m_oDrawnItems.clearLayers();
      this.m_oMap.remove();
      this.m_oMap = null;
    }
  }

  addManualBbox(oMap: any) {
    let oController = this;

    L.Control.Button = L.Control.extend({
      options: {
        position: "topleft"
      },
      onAdd: function (oMap) {

        // Create the container for the dialog
        let oContainer = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        // Create the button to add to leaflet
        let oButton = L.DomUtil.create('a', 'leaflet-control-button', oContainer);

        // Click stops on our button
        L.DomEvent.disableClickPropagation(oButton);

        // And here we decide what to do with our button
        L.DomEvent.on(oButton, 'click', function () {

          // We open the Manual Boundig Box Dialog
          let oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent)

          // Once is closed...
          oDialog.afterClosed().subscribe(oResult => {

            // We need a valid result
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {

              // With all the values for lat and lon
              if (isNaN(oResult.north) || isNaN(oResult.south) || isNaN(oResult.east) || isNaN(oResult.west)) {
                return;
              } 
              else {
                // Get the actual values
                let fNorth = parseFloat(oResult.north);
                let fSouth = parseFloat(oResult.south);
                let fEast = parseFloat(oResult.east);
                let fWest = parseFloat(oResult.west);

                // Create the bounds array
                let aoBounds = [[fNorth, fWest], [fSouth, fEast]];

                // And add the new rectangle layer to the map
                oController.addManualBboxLayer(oMap, aoBounds);
              }
            }
          })
        });

        // This is the "icon" of the button added to Leaflet
        oButton.innerHTML = 'M';
        
        oContainer.title = "Manual Bounding Box";

        return oContainer;
      },
      onRemove: function (map) { },
    })
    let oControl = new L.Control.Button();
    oControl.addTo(oMap);
  }

  addManualBboxLayer(oMap, aoBounds) {
    let oLayer = L.rectangle(aoBounds, { color: "#3388ff", weight: 1 });

    //remove old shape
    if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      this.m_oDrawnItems.clearLayers();
    }

    this.m_oDrawnItems.addLayer(oLayer);
    this.m_oMapService.zoomOnBounds(aoBounds, this.m_oMap);

    //Emit bounding box to listening componenet:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false) {

       this.m_oGeoJSON = oLayer.toGeoJSON();
       this.m_sPolygon = this.getPolygon();

    //   this.oMapInputChange.emit({
    //     geoJSON: this.m_oGeoJSON,
    //     polygon: this.m_sPolygon
    //   });
    }    
  }  

  addBoundingBoxDrawerOnMap(oMap) {

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMap)) {
      return null;
    }
    
    let oDrawControl = new L.Control.Draw();

    oDrawControl.setPosition('topleft');

    oDrawControl.setDrawingOptions({
      // what kind of shapes are disable/enable
      marker: false,
      polyline: false,
      circle: false,
      circlemarker: false,
      polygon: false,
      rectangle: <any>{ showArea: false }
    })

    oMap.addControl(oDrawControl);

    //Without this.m_oWasdiMap.on() the shape isn't saved on map
    let oController = this;
    
    oMap.on(L.Draw.Event.CREATED, function (event) {
      // Clear out old layer: 
      oController.m_oDrawnItems.clearLayers();
      let oLayer = event.layer;
      
      let bIsValid = oController.checkArea(oLayer);
      
      if (!bIsValid) {
        //show error message
        // turn the bounding box red
        oLayer.options.color = "#ff0000";
        // erase the bounding box
        oController.m_oMapInput.oBoundingBox.northEast = "";
        oController.m_oMapInput.oBoundingBox.southWest = "";
      }
      //save new shape in map
      oController.m_oDrawnItems.addLayer(oLayer);
      oController.m_oMapInput.emit(oController.m_oMapInput);
    });

    oMap.on(L.Draw.Event.DELETESTOP, function (event) {
      console.log("DELETE STOP")
      // oController.m_oDrawOptions.clearLayers();
      // let layer = event.layers;
    });

    return oMap;
  }  

  onDrawCreated(event) {
    
    //Add layer to map
    this.m_oDrawnItems.addLayer(event.layer)

    //on draw created -> need to check area 
    let bValid = this.checkArea(event.layer)

    //If not valid after check
    if (!bValid) {
      //set layer color
      event.layer.options.color = "#FF0000"
      return false;
    }
    //If valid after check: 
    this.m_oMapInput.oBoundingBox.northEast = event.layer._bounds._northEast;
    this.m_oMapInput.oBoundingBox.southWest = event.layer._bounds._southWest;

    this.m_oMapInputChange.emit(this.m_oMapInput);

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

  checkArea(oLayer) {

    let bIsValid=false;
    /**
     The following happens in this.onDrawCreated():  
     */
    this.m_oMapInput.oBoundingBox.northEast = oLayer._bounds._northEast;
    this.m_oMapInput.oBoundingBox.southWest = oLayer._bounds._southWest;

    let latlngs = oLayer.getLatLngs();
    // height and width respectively
    let oSide: number[] = [this.getDistance(latlngs[0][0], latlngs[0][1]), this.getDistance(latlngs[0][1], latlngs[0][2])];


    let fMaxSide = Math.max(...oSide);

    let fRatio = Math.max(...oSide) / Math.min(...oSide);

    // first element is the array itself to be passed
    let fArea = L.GeometryUtil.geodesicArea(oLayer.getLatLngs()[0]) / 1000000;

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
