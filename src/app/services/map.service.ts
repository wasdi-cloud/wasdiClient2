import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import Geocoder from 'leaflet-control-geocoder';
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import { latLng, Map, tileLayer, featureGroup } from 'leaflet';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManualBoundingBoxComponent } from '../shared/shared-components/manual-bounding-box/manual-bounding-box.component';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
// import * as L from "leaflet";

declare const L: any;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private m_oConstantsService: ConstantsService, private m_oDialog: MatDialog) {
    this.initTilelayer();
    this.m_oOptions = {
      layers: [
        this.m_oOSMBasic
      ],
      zoom: 3,
      center: latLng(0, 0),
      edit: { featureGroup: this.m_oDrawnItems }
    }

  }

  APIURL = this.m_oConstantsService.getAPIURL();

  // Reference to the base Layers
  m_oOSMBasic: any = null;
  m_oOpenTopoMap: any = null;
  m_oEsriWorldStreetMap: any = null;
  m_oEsriWorldImagery: any = null;
  m_oNASAGIBSViirsEarthAtNight2012: any = null;

  /**
   * Is the component toggle-albe to 3D map? 
   */
  m_bIsToggle: boolean;

  /**
   * declare object for Layers Control options
   */
  m_oLayersControl: any;

  m_oDrawnItems: L.FeatureGroup = new L.FeatureGroup();

  /**
   * Reference to the actual Leaflet map
   */
  m_oWasdiMap: any = null;

  /**
   * Actual Base Layer
   */
  m_oActiveBaseLayer: any;

  /**
   * Default Leaflet options
   */
  m_oOptions: any;

  /**
   * Geocoder control
   */
  m_oGeocoderControl = new Geocoder();

  m_oManualBoundingBoxSubscription: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  _m_oManualBoundingBoxSubscription$ = this.m_oManualBoundingBoxSubscription.asObservable();

  //Init options for leaflet-draw
  m_oDrawOptions: any = {
    position: 'topleft',
    draw: {
      circle: false,
      circlemarker: false,
      marker: false,
      polyline: false,
      polygon: false,
      rectangle: { shapeOptions: { color: "#4AFF00" }, showArea: false }
    },
    edit: {
      featureGroup: new L.FeatureGroup,
      edit: false,
      remove: false
    }
  }

  /**
   * Set the map object (when created not by the service)
   * @param oMap 
   */
  setMap(oMap: any) {
    this.m_oWasdiMap = oMap;
  }



  /**
   * Get the Map object
   * @returns {null | *}
   */
  getMap() {
    return this.m_oWasdiMap;
  }

  /**
   * Initalize base layers
   */
  initTilelayer() {

    FadeoutUtils.verboseLog("MapService.initTilelayer: initializing base layers");

    this.m_oOSMBasic = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this option disables loading tiles outside of the world bounds.
      noWrap: true
    });
    this.m_oOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    this.m_oEsriWorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
    this.m_oEsriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    this.m_oNASAGIBSViirsEarthAtNight2012 = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.m_oLayersControl = L.control.layers(
      {
        'Standard': this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "NASAGIBSViirsEarthAtNight2012": this.m_oNASAGIBSViirsEarthAtNight2012
      },
      {},
      { 'position': 'bottomright' }
    )
  }

  /**
   * Set Drawn Items
   */
  setDrawnItems() {
    this.m_oDrawnItems = new L.FeatureGroup;
  }

  /**
   * Initalize WASDI Map
   */
  initWasdiMap(sMapDiv: string) {
    FadeoutUtils.verboseLog("MapService.initWasdiMap: initializing Leaflet");
    this.m_oWasdiMap = this.initMap(sMapDiv);
  }

  /**
   * Init the Map
   * @param sMapDiv 
   */
  initMap(sMapDiv) {

    FadeoutUtils.verboseLog("MapService.initMap: creating the map");

    let oMap: L.Map = L.map(sMapDiv, {
      zoomControl: false,
      center: [0, 0],
      zoom: 3
    });

    this.m_oOSMBasic.addTo(oMap)

    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);

    this.m_oLayersControl.addTo(oMap);

    // center map
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    let oActiveBaseLayer = this.m_oActiveBaseLayer;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // e.layer.bringToBack();
      oActiveBaseLayer = e;
    });

    return oMap;
  }

  /**
   * Init the Map Singleton
   * @param sMapDiv 
   */
  initMapSingleton(sMapDiv) {
    var oOSMBasic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this map option disables world wrapping. by default, it is false.
      continuousWorld: false,
      // this option disables loading tiles outside of the world bounds.
      noWrap: true
    });

    var oMap = L.map(sMapDiv, {
      zoomControl: false,
      //layers: [this.m_oOSMBasic, this.m_oOpenTopoMap, this.m_oEsriWorldStreetMap, this.m_oEsriWorldImagery, this.m_oNASAGIBSViirsEarthAtNight2012],
      layers: [oOSMBasic],
      keyboard: false
      //maxZoom: 22
    });

    // coordinates in map find this plugin in lib folder
    // L.control.mousePosition().addTo(oMap);

    //scale control
    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);

    //layers control
    var oLayersControl = L.control.layers(
      {
        "Standard": this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "NASAGIBSViirsEarthAtNight2012": this.m_oNASAGIBSViirsEarthAtNight2012
      },
      {},
      {
        'position': 'bottomright'
      }
    );
    oLayersControl.addTo(oMap);

    // center map
    var southWest = L.latLng(0, 0),
      northEast = L.latLng(0, 0),
      oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);


    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // console.log(e);
      //e.layer.bringToBack();
      // oActiveBaseLayer = e;
    });

    return oMap;
  }


  /**
   * Handler function for drawing rectangles/polygons/etc on map - Creates bounding box to string
   * @param event
   */
  onDrawCreated(event: any) {
    const { layerType, layer } = event;
    if (layerType === "rectangle") {
      const rectangleCoordinates = layer._bounds

      let selectedCoordinate = new L.LatLngBounds(rectangleCoordinates._northEast, rectangleCoordinates._southWest)
      let m_sSelectedBBox = selectedCoordinate.toBBoxString();
    }
    this.m_oDrawnItems.addLayer(layer);
  }

  /**
   * Handler function for drawing rectangles on the SEARCH map 
   * @param oEvent 
   */
  onSearchDrawCreated(oEvent: any) {
    const { layerType, layer } = oEvent;

    if (layerType === "rectangle") {
      const rectangleCoordinates = layer._latlngs
      this.m_oDrawnItems.addLayer(layer);

      return rectangleCoordinates;
    }
  }

  /**
    * Init geo search plugin, the search bar for geographical reference on the map
    * @param opt if present, the search bar is placed on the bottom right corner of the map.
    * @references https://github.com/perliedman/leaflet-control-geocoder
    */
  initGeoSearchPluginForOpenStreetMap() {
    this.m_oGeocoderControl.options.position = "bottomright";

  }
  /**
   * Clear Map 
   */
  clearMap() {

    if (this.m_oWasdiMap) {
      FadeoutUtils.verboseLog("MapService.clearMap: cleaning the map instance")
      this.m_oDrawnItems.clearLayers();
      this.m_oWasdiMap.remove();
      this.m_oWasdiMap = null;
    }
    else {
      FadeoutUtils.verboseLog("MapService.clearMap: map was already null")
    }
  }

  /**
   * 
   * @param oRectangle 
   * @returns {boolean}
   */
  changeStyleRectangleMouseOver(oRectangle) {
    if (!oRectangle) {
      console.log("Error: rectangle is undefined");

      return false;
    }
    oRectangle.setStyle({ weight: 3, fillOpacity: 0.7 });
    return true;
  }

  /**
   * Change style of rectangle when the music leaves the layer (TABLE CASE)
   * @param oRectangle
   * @returns {boolean}
   */
  changeStyleRectangleMouseLeave(oRectangle) {
    if (!oRectangle) {
      console.log("Error: rectangle is undefined");

      return false;
    }
    oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
    return true;
  }

  /******* LAYER HANDLERS *******/

  /**
   * Remove a layer from the map
   * @param oLayer
   * @returns {boolean}
   */
  removeLayerFromMap(oLayer) {
    if (!oLayer) {
      return false;
    }
    oLayer.remove();
    return true;
  }

  /**
   * Convert boundaries
   * @param sBoundaries
   * @returns {Array}
   */
  convertBboxInBoundariesArray(sBbox) {
    let asBoundaries = sBbox.split(",");
    let iNumberOfBoundaries = asBoundaries.length;
    let aoReturnValues = [];
    let iIndexReturnValues = 0;
    for (let iBoundaryIndex = 0; iBoundaryIndex < iNumberOfBoundaries; iBoundaryIndex++) {
      if (iBoundaryIndex % 2 === 0) {
        aoReturnValues[iIndexReturnValues] = [asBoundaries[iBoundaryIndex], asBoundaries[iBoundaryIndex + 1]];
        iIndexReturnValues++;
      }
    }
    return aoReturnValues;
  }

  /**
    * Add to the 2D Map all the bounding box rectangles of a workspace
    * @param aoProducts
    */
  addAllWorkspaceRectanglesOnMap(aoProducts, sColor) {
    if (!aoProducts) {
      return false;
    }
    if (!sColor) {
      sColor = "#ff7800";
    }
    try {
      for (let iProduct = 0; iProduct < aoProducts.length; iProduct++) {
        if (this.isAlreadyDrawRectangle(aoProducts[iProduct].bbox) === false) {
          this.addRectangleOnMap(aoProducts[iProduct].bbox, sColor, aoProducts[iProduct].fileName);
        }
      }
    }
    catch (e) {
      console.log(e);
    }
    console.log("MapService.addAllWorkspaceRectanglesOnMap: added rectangles to map")
    return true;
  }

  isAlreadyDrawRectangle(aoProductBbox) {
    let isAlreadyDraw = false;
    try {
      let aoBounds = this.convertBboxInBoundariesArray(aoProductBbox);
      let oRectangle = L.polygon(aoBounds);
      let aoLatLngsProduct: Array<any> = oRectangle.getLatLngs();

      let oMap = this.getMap();

      oMap.eachLayer(function (layer) {

        if (layer instanceof L.Polygon) {
          let aoLayerLatLng = layer.getLatLngs();
          let iLatLngsProductLength = aoLatLngsProduct[0].length;

          for (let iIndexLatLngProduct = 0; iIndexLatLngProduct < iLatLngsProductLength; iIndexLatLngProduct++) {

            let bAreEquals = aoLatLngsProduct[0][iIndexLatLngProduct].equals(aoLayerLatLng[0][iIndexLatLngProduct], 0.1);
            if (bAreEquals) {
              isAlreadyDraw = true;
            }
          }
        }
      });
    }
    catch (e) {
      return false;
    }

    return isAlreadyDraw;

  }
  /**
    * Add a rectangle shape on the map
    * @param aaBounds
    * @param sColor
    * @param iIndexLayers
    * @returns {null}
    */
  addRectangleByBoundsArrayOnMap(aaBounds, sColor, iIndexLayers) {
    if (!aaBounds) {
      return null;
    }
    for (let iIndex = 0; iIndex < aaBounds.length; iIndex++) {
      if (!aaBounds[iIndex]) {
        return null;
      }
    }
    //default color
    if (!sColor) { sColor = "#ff7800"; }

    // create an colored rectangle
    // weight = line thickness
    let oRectangle = L.polygon(aaBounds, { color: sColor, weight: 1 }).addTo(this.m_oWasdiMap);

    if (iIndexLayers) {//event on click
      oRectangle.on("click", function (event) {
        //->problematic here
        console.log("on-mouse-click-rectangle")
        //$rootScope.$broadcast('on-mouse-click-rectangle', { rectangle: oRectangle });//SEND MESSAGE TO IMPORTCONTROLLER
      });
      //mouse over event change rectangle style
      oRectangle.on("mouseover", function (event) {//SEND MESSAGE TO IMPORT CONTROLLER
        oRectangle.setStyle({ weight: 3, fillOpacity: 0.7 });
        oRectangle.getBounds();
      });
      //mouse out event set default value of style
      oRectangle.on("mouseout", function (event) {//SEND MESSAGE TO IMPORT CONTROLLER
        oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
      });
    }
    return oRectangle;
  }
  /**
  * Add a rectangle shape on the map
  * @param aaBounds
  * @param sColor
  * @param sReferenceName
  * @returns {null}
  */
  addRectangleOnMap(sBbox, sColor, sReferenceName) {
    try {
      if (!sBbox) {
        return null;
      }

      let aoBounds = this.convertBboxInBoundariesArray(sBbox);

      for (let iIndex = 0; iIndex < aoBounds.length; iIndex++) {
        if (!aoBounds[iIndex]) {
          return null;
        }
      }

      //default color
      if (!sColor) {
        sColor = "#ff7800";
      }
      // create an colored rectangle
      // weight = line thickness
      let oRectangle = L.polygon(aoBounds, { color: sColor, weight: 1 }).addTo(this.m_oWasdiMap);
      //event on click
      if (sReferenceName) {
        oRectangle.on("click", function (event) {
        });
      }

      //mouse over event change rectangle style
      oRectangle.on("mouseover", function (event) {
        oRectangle.setStyle({ weight: 3, fillOpacity: 0.7 });
        oRectangle.getBounds();
      });

      //mouse out event set default value of style
      oRectangle.on("mouseout", function (event) {
        oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
      });
      return oRectangle;
    } catch (e) {
      return null;
    }
  };

  /******* ZOOM AND NAVIGATION FUNCTIONS ********/

  /**
   * Center the world
   */
  goHome() {
    this.m_oWasdiMap.fitWorld();
  };


  flyToWorkspaceBoundingBox(aoProducts) {
    try {
      if (!aoProducts) { return false; }
      if (aoProducts.length == 0) { return false; }

      let aoBounds = [];

      for (let iProducts = 0; iProducts < aoProducts.length; iProducts++) {
        let oProduct = aoProducts[iProducts];
        let aoProductBounds = this.convertBboxInBoundariesArray(oProduct.bbox);
        aoBounds = aoBounds.concat(aoProductBounds);
      }
      this.m_oWasdiMap.flyToBounds([aoBounds]);
      return true;
    }
    catch (e) {
      console.log(e);
    }
    return true;
  };

  /**
   * flyOnRectangle
   * @param oRectangle
   * @returns {boolean}
   */
  flyOnRectangle(oRectangle) {
    if (!oRectangle) {
      return false;
    }
    if (!this.m_oWasdiMap) {
      return false;
    }
    this.m_oWasdiMap.flyToBounds(oRectangle.getBounds());
    return true;
  };

  /**
   * Zoom on bounds
   * @param aBounds
   * @returns {boolean}
   */
  zoomOnBounds(aBounds) {
    try {
      if (!aBounds) { return false; }
      if (aBounds.length == 0) { return false; }

      this.m_oWasdiMap.flyToBounds([aBounds]);
      return true;
    }
    catch (e) {
      console.log(e);
    }
    return true;
  };

  /**
   * Zoom 2d map based on the bbox string form server
   * @param sBbox
   * @returns {null}
   */
  zoomBandImageOnBBOX(sBbox) {
    try {
      if (!sBbox) {
        return null;
      }

      let aoBounds = this.convertBboxInBoundariesArray(sBbox);

      for (let iIndex = 0; iIndex < aoBounds.length; iIndex++) {
        if (!aoBounds[iIndex]) {
          return null;
        }
      }

      this.m_oWasdiMap.flyToBounds(aoBounds);
    }
    catch (e) {
      console.log(e);
    }
  };

  /**
   * Zoom 2d Map on a geoserver Bounding box string from server
   * @param geoserverBoundingBox
   */
  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox) {
    try {
      if (!geoserverBoundingBox) {
        console.log("MapService.zoomBandImageOnGeoserverBoundingBox: geoserverBoundingBox is null or empty ");
        return;
      }

      geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, "");
      let oBounds = JSON.parse(geoserverBoundingBox);

      //Zoom on layer
      let corner1 = L.latLng(oBounds.maxy, oBounds.maxx),
        corner2 = L.latLng(oBounds.miny, oBounds.minx),
        bounds = L.latLngBounds(corner1, corner2);

      this.m_oWasdiMap.flyToBounds(bounds, { maxZoom: 8 });
    }
    catch (e) {
      console.log(e);
    }
  };

  /**
   * Zoom on an external layer
   * @param oLayer
   * @returns {boolean}
   */
  zoomOnExternalLayer(oLayer) {

    try {
      if (!oLayer) {
        return false;
      }
      let oBoundingBox = (oLayer.BoundingBox[0].extent);
      if (!oBoundingBox) {
        return false;
      }

      let corner1 = L.latLng(oBoundingBox[1], oBoundingBox[2]),
        corner2 = L.latLng(oBoundingBox[3], oBoundingBox[0]),
        bounds = L.latLngBounds(corner1, corner2);

      this.getMap().flyToBounds(bounds);
    }
    catch (e) {
      console.log(e);
    }
    return true;
  };

  /**
   *
   * @param bbox
   * @returns {*}
   */
  fromBboxToRectangleArray(bbox) {

    // skip if there isn't the product bounding box
    if (!bbox) return null;

    let aiInvertedArraySplit = [];
    let aoArraySplit;

    // Split bbox string
    aoArraySplit = bbox.split(",");

    let iArraySplitLength = aoArraySplit.length;

    if (iArraySplitLength < 10) return null;

    for (let iIndex = 0; iIndex < iArraySplitLength - 1; iIndex = iIndex + 2) {
      aiInvertedArraySplit.push(aoArraySplit[iIndex + 1]);
      aiInvertedArraySplit.push(aoArraySplit[iIndex]);
    }

    return aiInvertedArraySplit;
  };

  addRectangleByGeoserverBoundingBox(geoserverBoundingBox, sColor, oMap = this.getMap()) {
    try {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(geoserverBoundingBox)) {
        console.log("MapService.addRectangleByGeoserverBoundingBox: geoserverBoundingBox is null or empty ");
        return null;
      } else {
        if ((FadeoutUtils.utilsIsObjectNullOrUndefined(sColor) === true) || (FadeoutUtils.utilsIsStrNullOrEmpty(sColor) === true)) {
          sColor = "#ff7800";
        }

        geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, "");
        let oBounds = JSON.parse(geoserverBoundingBox);
        //Zoom on layer
        // let corner1 = L.latLng(oBounds.maxy, oBounds.maxx);
        // let corner2 = L.latLng(oBounds.miny, oBounds.minx);
        let bounds: L.LatLngBoundsExpression = L.latLngBounds([oBounds.maxy, oBounds.maxx], [oBounds.miny, oBounds.minx]);
        let oRectangle = L.rectangle(bounds, { color: sColor, weight: 2 }).addTo(oMap);

        return oRectangle
      }
    } catch (oError) {
      console.log(oError)
    }
    return null;
  }

  /**
 * Adds a Layer to the 2D Map 
 * @param sLayerId Layer Id
 * @param sServer  Geoserver address. Of null the default one from Constant Service is taken
 * @returns True if all is fine, False in case of error
 */
  addLayerMap2DByServer(sLayerId: string, sServer: string) {
    if (sLayerId == null) {
      return false;
    }
    if (sServer == null) {
      sServer = this.m_oConstantsService.getWmsUrlGeoserver();
    }

    let oMap = this.getMap();

    let oWmsLayer = L.tileLayer.wms(sServer, {
      layers: sLayerId,
      format: 'image/png',
      transparent: true,
      noWrap: true
    });
    oWmsLayer.setZIndex(1000);
    oWmsLayer.addTo(oMap);
    return true;
  }


  addManualBbox(oMap: any) {
    let oController = this;
    L.Control.Button = L.Control.extend({
      options: {
        position: "topright"
      },
      onAdd: function (map) {
        let container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        let button = L.DomUtil.create('a', 'leaflet-control-button', container);
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', function () {
          let oDialog = oController.m_oDialog.open(ManualBoundingBoxComponent)
          oDialog.afterClosed().subscribe(oResult => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResult) === false) {
              if (isNaN(oResult.north) || isNaN(oResult.south) || isNaN(oResult.east) || isNaN(oResult.west)) {
                return;
              } else {
                let fNorth = parseFloat(oResult.north);
                let fSouth = parseFloat(oResult.south);
                let fEast = parseFloat(oResult.east);
                let fWest = parseFloat(oResult.west);

                let aoBounds = [[fNorth, fWest], [fSouth, fEast]];
                oController.addManualBboxLayer(aoBounds);
              }
            }
          })
        });
        button.innerHTML = 'M';
        container.title = "Manual Bounding Box";

        return container;
      },
      onRemove: function (map) { },
    })
    let oControl = new L.Control.Button();
    oControl.addTo(oMap);
  }

  addManualBboxLayer(aoBounds) {
    let oLayer = L.rectangle(aoBounds, { color: "#3388ff", weight: 1 });
    // oController.m_oRectangleOpenSearch = oLayer;

    //remove old shape
    if (this.m_oDrawnItems && this.m_oDrawnItems.getLayers().length !== 0) {
      this.m_oDrawnItems.clearLayers();
    }

    this.m_oDrawnItems.addLayer(oLayer);
    this.zoomOnBounds(aoBounds);

    //Emit bounding box to listening componenet:
    this.m_oManualBoundingBoxSubscription.next(oLayer);
  }
}
