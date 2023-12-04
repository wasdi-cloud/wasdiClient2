import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import Geocoder from 'leaflet-control-geocoder';
import 'node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import { latLng, Map, tileLayer, featureGroup } from 'leaflet';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import * as L from "leaflet";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private m_oConstantsService: ConstantsService) {
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


  //Layers
  m_oOSMBasic: any;
  m_oOpenTopoMap: any;
  m_oEsriWorldStreetMap: any;
  m_oEsriWorldImagery: any;
  m_oNASAGIBSViirsEarthAtNight2012: any;

  //Is the component toggle-albe to 3D map? 
  m_bIsToggle: boolean;

  //declare object for Layers Control options
  m_oLayersControl: any;

  m_oDrawnItems: L.FeatureGroup = new L.FeatureGroup();

  m_oWasdiMap: any = null;

  //Actual Base Layer
  m_oActiveBaseLayer: any;

  //Default Leaflet options
  m_oOptions: any;

  GeocoderControl = new Geocoder();

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
    this.m_oOSMBasic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    this.m_oNASAGIBSViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
      attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
      bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
      minZoom: 1,
      maxZoom: 8,
      //format: 'jpg',
      //time: '',
      //tilematrixset: 'GoogleMapsCompatible_Level'
    });

    this.m_oLayersControl = {
      baseLayers: {
        'Standard': this.m_oOSMBasic,
        "OpenTopoMap": this.m_oOpenTopoMap,
        "EsriWorldStreetMap": this.m_oEsriWorldStreetMap,
        "EsriWorldImagery": this.m_oEsriWorldImagery,
        "NASAGIBSViirsEarthAtNight2012": this.m_oNASAGIBSViirsEarthAtNight2012
      }
    }
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
    if (this.m_oWasdiMap !== null) {
      this.initTilelayer();
    }
    this.m_oWasdiMap = this.initMap(sMapDiv);
  }

  /**
   * Init the Map
   * @param sMapDiv 
   */
  initMap(sMapDiv) {
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
    // center map
    let southWest = L.latLng(0, 0);
    let northEast = L.latLng(0, 0);

    let oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    let oActiveBaseLayer = this.m_oActiveBaseLayer;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // console.log(e);
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
    let oOSMBasic = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // this map option disables world wrapping. by default, it is false.
      //continuousWorld: false,
      // this option disables loading tiles outside of the world bounds.
      //noWrap: true
    });

    let oMap = L.map(sMapDiv, {
      zoomControl: false,
      layers: [oOSMBasic],
      keyboard: false
    });

    // coordinates in map find this plugin in lib folder
    //L.control.mousePosition().addTo(oMap);

    //scale control
    L.control.scale({
      position: "bottomright",
      imperial: false
    }).addTo(oMap);

    //layers control
    let oLayersControl = L.control.layers(
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
    let southWest = L.latLng(0, 0),
      northEast = L.latLng(0, 0),
      oBoundaries = L.latLngBounds(southWest, northEast);

    oMap.fitBounds(oBoundaries);
    oMap.setZoom(3);

    let oActiveBaseLayer = oOSMBasic;

    //add event on base change
    oMap.on('baselayerchange', function (e) {
      // console.log(e);
      // e.layer.bringToBack();
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
   * Init map Editor
   * @param sMapDiv
   * @returns {boolean}
   */
  initMapEditor(sMapDiv) {
    if (!sMapDiv) {
      return false;
    }
    this.initWasdiMap(sMapDiv)
    return true;
  }


  /**
    * Init geo search plugin, the search bar for geographical reference on the map
    * @param opt if present, the search bar is placed on the bottom right corner of the map.
    * @references https://github.com/perliedman/leaflet-control-geocoder
    */
  initGeoSearchPluginForOpenStreetMap() {
    this.GeocoderControl.options.position = "bottomright";

  }
  /**
   * Clear Map 
   */
  clearMap(sMapDiv: string) {
    if (this.m_oWasdiMap) {
      this.m_oWasdiMap.remove();
    }
  }

  /**
   * 
   */
  deleteDrawShapeEditToolbar() {
    this.m_oDrawnItems.clearLayers();
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
   * Set basic map 
   * @returns {boolean}
   */
  setBasicMap() {
    if (!this.m_oOSMBasic) {
      return false;
    }
    this.m_oWasdiMap.addLayer(this.m_oOSMBasic, true);
    return true;
  }

  /**
   * Remove basic map 
   * @returns {boolean}
   */
  removeBasicMap() {
    if (!this.m_oOSMBasic) {
      return false;
    }
    this.removeLayerFromMap(this.m_oOSMBasic);
    return true;
  }

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
    * Remove all layers from the map
    */
  removeLayersFromMap() {
    this.m_oWasdiMap.eachLayer(function (layer: any) {
      this.m_oWasdiMap.removeLayer(layer);
    });
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
        console.log("on-mouse-over-rectangle")
        // $rootScope.$broadcast('on-mouse-over-rectangle', { rectangle: oRectangle });
        oRectangle.getBounds();
      });
      //mouse out event set default value of style
      oRectangle.on("mouseout", function (event) {//SEND MESSAGE TO IMPORT CONTROLLER
        oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
        console.log("on-mouse-leave-rectangle")
        //$rootScope.$broadcast('on-mouse-leave-rectangle', { rectangle: oRectangle });
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
          //$rootScope.$broadcast('on-mouse-click-rectangle', { rectangle: oRectangle });\
          console.log("on-mouse-click-rectangle")
        });
      }

      //mouse over event change rectangle style
      oRectangle.on("mouseover", function (event) {
        oRectangle.setStyle({ weight: 3, fillOpacity: 0.7 });
        console.log("on-mouse-over-rectangle")
        //$rootScope.$broadcast('on-mouse-over-rectangle', { rectangle: oRectangle });
        oRectangle.getBounds();
      });

      //mouse out event set default value of style
      oRectangle.on("mouseout", function (event) {
        oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
        console.log("on-mouse-leave-rectangle")
        //$rootScope.$broadcast('on-mouse-leave-rectangle', { rectangle: oRectangle });
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
   * This method works only for s1 products
   * @param boundingBox The bounding box declared by product
   * @param geoserverBoundingBox The bounding box declared by the Geo Server when a band has been published
   * @returns {boolean}
   */
  isProductGeoreferenced(boundingBox, geoserverBoundingBox) {
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(boundingBox) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(geoserverBoundingBox) === true)) {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(boundingBox) === true) {
        console.debug("Product bounding box is null");
        // Impossible to assume if is correct or not. Assume true
        return true;
      }
      else if (FadeoutUtils.utilsIsObjectNullOrUndefined(geoserverBoundingBox) === true) {
        console.debug("Geoserver bounding box is null");
      }

      return false;
    }

    if ((FadeoutUtils.utilsIsStrNullOrEmpty(boundingBox) === true) || (FadeoutUtils.utilsIsStrNullOrEmpty(geoserverBoundingBox) === true)) {
      if (FadeoutUtils.utilsIsStrNullOrEmpty(boundingBox) === true) {
        console.debug("Product bounding box is null");
        // Impossible to assume if is correct or not. Assume true
        return true;
      }
      else if (FadeoutUtils.utilsIsStrNullOrEmpty(geoserverBoundingBox) === true) {
        console.debug("Geoserver bounding box is null");
      }
      return false;
    }

    var oGeoserverBoundingBox = this.parseGeoserverBoundingBox(geoserverBoundingBox);

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oGeoserverBoundingBox)) return false;

    var asBoundingBox = this.fromBboxToRectangleArray(boundingBox);

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asBoundingBox)) return false;

    var aoLatLngs = [];

    for (var iPoints = 0; iPoints < asBoundingBox.length - 2; iPoints += 2) {
      var oLatLon = [parseFloat(asBoundingBox[iPoints + 1]), parseFloat(asBoundingBox[iPoints])];
      aoLatLngs.push(oLatLon);
    }

    var oBBPolygon = L.polygon(aoLatLngs, { color: 'red' });

    var oBBCenter = oBBPolygon.getBounds().getCenter();

    //it takes the center of the bounding box
    var oMidPointGeoserverBoundingBox = FadeoutUtils.utilsGetMidPoint(oGeoserverBoundingBox.maxx, oGeoserverBoundingBox.maxy, oGeoserverBoundingBox.minx, oGeoserverBoundingBox.miny);
    //var oMidPointBoundingBox = utilsGetMidPoint( parseFloat(asBoundingBox[0]), parseFloat(asBoundingBox[1]), parseFloat(asBoundingBox[4]), parseFloat(asBoundingBox[5]));
    var oMidPointBoundingBox: any = {};
    oMidPointBoundingBox.x = oBBCenter.lng;
    oMidPointBoundingBox.y = oBBCenter.lat;
    //TODO FIX IT
    var isMidPointGeoserverBoundingBoxInBoundingBox = FadeoutUtils.utilsIsPointInsideSquare(oMidPointGeoserverBoundingBox.x, oMidPointGeoserverBoundingBox.y, oBBPolygon.getBounds().getEast(), oBBPolygon.getBounds().getNorth(), oBBPolygon.getBounds().getWest(), oBBPolygon.getBounds().getSouth());
    var isMidPointBoundingBoxGeoserverBoundingBox = FadeoutUtils.utilsIsPointInsideSquare(oMidPointBoundingBox.x, oMidPointBoundingBox.y, oGeoserverBoundingBox.maxx, oGeoserverBoundingBox.maxy, oGeoserverBoundingBox.minx, oGeoserverBoundingBox.miny);
    if ((isMidPointBoundingBoxGeoserverBoundingBox === true) && (isMidPointGeoserverBoundingBoxInBoundingBox === true)) {
      return true;
    }
    return false;
  };

  /**
   *
   * @param geoserverBoundingBox
   * @returns {null}
   */
  parseGeoserverBoundingBox(geoserverBoundingBox) {
    // Check the input
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(geoserverBoundingBox)) {
      console.log("geoserverBoundingBox: geoserverBoundingBox is null");
      return null;
    }

    // Parse the bounding box
    geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, "");
    var oBoundingBox = JSON.parse('{"miny":43.150066,"minx":-80.030044,"crs":"EPSG:4326","maxy":43.380082,"maxx":-79.710091}');
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oBoundingBox)) {
      console.log("GlobeService.zoomBandImageOnGeoserverBoundingBox: parsing bouning box is null");
      return null;
    }
    return oBoundingBox;
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


  productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, asBbox, sLayerId) {
    if (this.isProductGeoreferenced(asBbox, sGeoserverBBox) === true) {
      var oRectangleBoundingBoxMap = this.addRectangleByGeoserverBoundingBox(sGeoserverBBox, sColor);

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangleBoundingBoxMap) === false) {
        console.log(oRectangleBoundingBoxMap.options);
        //the options.layers property is used for remove the rectangle to the map
        oRectangleBoundingBoxMap.options["layers"] = "wasdi:" + sLayerId;
      }
    }
    if (this.isProductGeoreferenced(asBbox, sGeoserverBBox) === true) {
      return true;
    } else {
      return false
    }
  }
}
