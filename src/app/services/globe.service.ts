import { Injectable } from '@angular/core';

//Import Environment file:
import { environment } from 'src/environments/environment';

//Import Fadeout Utilities:
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { ConstantsService } from './constants.service';
import { MapService } from './map.service';

//Declare Cesium:
declare let Cesium: any;

@Injectable({
  providedIn: 'root'
})

export class GlobeService {

  /**
   * Reference to the Cesium Globe Objecet
   */
  m_oWasdiGlobe: any = null;

  /**
   * List of visible layers. It is a pointer to the this.m_oWasdiGlobe.imageryLayers Array
   */
  m_aoLayers: any[] = null;
  /**
   * Default long for home view
   */
  LONG_HOME: number = 0;
  /**
   * Default lat for home view
   */
  LAT_HOME: number = 0;
  /**
   * Default zoom for home view
   */
  HEIGHT_HOME: number = 20000000; 
  /**
   * Globe zoom
   */
  GLOBE_LAYER_ZOOM: number = 2000000;
  /**
   * Workspaces default zoome
   */
  GLOBE_WORKSPACE_ZOOM: number = 4000000;

  /**
   * Create an instance of the service
   * @param m_oMapService 
   * @param m_oConstantsService 
   */
  constructor(private m_oMapService: MapService, private m_oConstantsService: ConstantsService) 
  { 
  }

  /**
   * Init the Globe on a specific Div
   * @param sGlobeDiv Div element id
   */
  initGlobe(sGlobeDiv: string) {

    if (window.WebGL2RenderingContext) {

      try {
        let oGlobeOptions = {
          timeline: false,
          animation: false,
          baseLayerPicker: true,
          fullscreenButton: false,
          infoBox: true,
          selectionIndicator: true,
          geocoder: true,
          navigationHelpButton: false,
          sceneModePicker: false,
          homeButton: false,
          scene3DOnly: true
        };
        Cesium.Ion.defaultAccessToken = environment.cesiumToken;

        if (this.m_oWasdiGlobe != null) {
          this.clearGlobe();
        }

        this.m_oWasdiGlobe = new Cesium.Viewer(sGlobeDiv, oGlobeOptions);

        // Select OpenLayers and Cesium DEM Terrain by default
        this.m_oWasdiGlobe.baseLayerPicker.viewModel.selectedImagery = this.m_oWasdiGlobe.baseLayerPicker.viewModel.imageryProviderViewModels[14];
        this.m_oWasdiGlobe.baseLayerPicker.viewModel.selectedTerrain = this.m_oWasdiGlobe.baseLayerPicker.viewModel.terrainProviderViewModels[1];

        this.m_aoLayers = this.m_oWasdiGlobe.imageryLayers;

      } catch (error) {
        console.log("Error in Cesium Globe: " + error)
      }
    } else {
      // ERROR:  browser doesn't support WebGL
      console.log("Error in Cesium Globe: missing WebGl");
    }
  }

  /**
   * Clear the globe to free the resources
   */
  clearGlobe() {

    if (this.m_oWasdiGlobe) {
      
      this.removeAllEntities();

      this.m_oWasdiGlobe.destroy();
      this.m_oWasdiGlobe = null;
      this.m_aoLayers = null;
    }
    else {
      this.m_aoLayers = null;
    }
  }

  /**
   * Get a reference to the globe
   * @returns Globe Object
   */
  getGlobe() {
    return this.m_oWasdiGlobe;
  }

  /**
   * Get the default Workspace Zoom
   * @returns 
   */
  getWorkspaceZoom() {
    return this.GLOBE_WORKSPACE_ZOOM;
  }

  /**
   * Get the list of layers in the globe
   * @returns Array of Layers shown in the globe
   */
  getGlobeLayers = function () {
    return this.m_aoLayers;
  }

  /**
   * Moves the camera in the coordinates with an animated fligth
   * @param long Target Long
   * @param lat Target Lat
   * @param height Height of the camera
   */
  flyTo(long: number, lat: number, height: number) {
    this.m_oWasdiGlobe.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(long, lat, height),
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });
  }

  /**
   * Moves the camera at home coordinates with an animated fligth
   */
  flyHome() {
    this.m_oWasdiGlobe.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(this.LONG_HOME, this.LAT_HOME, this.HEIGHT_HOME),
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });
  }

  /**
   * Add a rectangle (ie foot print) ot the globe starting from an array of integers representing lon,lat degrees
   * 
   * @param aiArray A list of longitude and latitude values. Values alternate [longitude, latitude, longitude, latitude...].
   * @returns The Globe entity if added, null in case of errors
   */
  addRectangleOnGlobeParamArray(aiArray: any[]) {

    // Safe Programming check
    if (!aiArray) {
      return null;
    }

    if (!this.m_oWasdiGlobe) {
      return null;
    }

    // Check if there are Nan Values in the array ( => it becomes invalid)
    let bHasNan = false;

    for (let iIndex = 0; iIndex < aiArray.length; iIndex = iIndex + 1) {
      if (isNaN(aiArray[iIndex])) {
        return null;
      }
    }

    try {

      // Create the new Polygon
      let oNewPolygon = {
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(aiArray)),
        outline: true,
        outlineColor: Cesium.Color.RED.withAlpha(1),
        outlineWidth: 10,
        material: Cesium.Color.RED.withAlpha(0.2)
      }

      // Get the Globe Entities
      let aoEntities = this.m_oWasdiGlobe.entities.values;

      // Search if the same BBOX has already been added
      for (let i = 0; i < aoEntities.length; i++) {

        // Get the entity
        let oEntity = aoEntities[i];

        // Check if it is a valid one (can be a satellite sprite also)
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEntity.polygon)) {
          continue;
        }

        // Assume is equal: we will set this = false if a point of the poly is different
        let bIsEqual = true;

        // For all the points of the poly already added to the globe
        for (let iPolygonPoints = 0; iPolygonPoints < oEntity.polygon.hierarchy.getValue().positions.length; iPolygonPoints++) {

          // Safe programming: index < of size
          if (iPolygonPoints < oNewPolygon.hierarchy.positions.length) {
            // The position is the same?
            if (!oEntity.polygon.hierarchy.getValue().positions[iPolygonPoints].equalsEpsilon(oNewPolygon.hierarchy.positions[iPolygonPoints], 0.1)) {
              // No! One point different => different poly. Try next one.
              bIsEqual = false;
              break;
            }
          }
        }

        if (bIsEqual) {
          //If we found an equal bbox we can return this as Rectangle
          return oEntity;
        }
      }

      // If we exit from the above cycle, there are no entities with the same poly, so add it.
      let oRectangle = this.m_oWasdiGlobe.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(aiArray)),
          outline: true,
          outlineColor: Cesium.Color.RED.withAlpha(1),
          outlineWidth: 10,
          material: Cesium.Color.RED.withAlpha(0.2)
        }
      });

      return oRectangle;
    }
    catch (oError) {
      console.log(oError)
      return null;
    }
  }

  /**
   * Removes all the entites added to the globe
   */
  removeAllEntities() {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oWasdiGlobe)) {

      if (this.m_oWasdiGlobe.entities != null) {
        this.m_oWasdiGlobe.entities.removeAll();
      }
    }
  }

  /**
   * Init the globe on the specified Div and start to rotate
   * @param sGlobeDiv 
   */
  initRotateGlobe(sGlobeDiv: string) {

    //check if browser supports WebGL
    if (window.WebGLRenderingContext) {
      // browser supports WebGL
      try {

        this.initGlobe(sGlobeDiv);
        let oController = this;

        //rotate globe
        this.m_oWasdiGlobe.camera.flyHome(0);
        this.startRotationGlobe(3);

        this.m_oWasdiGlobe.scene.preRender.addEventListener(function (scene, time) {
          if (scene.mode !== Cesium.SceneMode.SCENE3D) {
            return;
          }
          let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
          if (Cesium.defined(icrfToFixed)) {
            let offset = Cesium.Cartesian3.clone(oController.m_oWasdiGlobe.camera.position);
            let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
            oController.m_oWasdiGlobe.camera.lookAtTransform(transform, offset);
          };
        });
      } catch (err) {
        console.log("Error in Cesium Globe: " + err);
      }
    }
    else {
      // ERROR  browser doesn't support WebGL
      console.log("Error in Cesium Globe miss WebGl");
    }
  }

  /**
   * Stop the rotation of the globe
   */
  stopRotationGlobe() {
    this.m_oWasdiGlobe.clock.multiplier = 0;
    this.m_oWasdiGlobe.clock.canAnimate = true;
    this.m_oWasdiGlobe.clock.shouldAnimate = true;
  }

  /**
   * Start the rotation of the globe
   * @param iRotationValue 
   * @returns 
   */
  startRotationGlobe(iRotationValue: number) {
    if (typeof iRotationValue !== "number") {
      return false;
    }
    this.m_oWasdiGlobe.clock.canAnimate = true;
    this.m_oWasdiGlobe.clock.shouldAnimate = true;
    this.m_oWasdiGlobe.clock.multiplier = iRotationValue * 600;
    return true;
  }

  /**
   * Draws an image in a specific point of the globe
   * 
   * @param aiPositionInput Array of integers = [lon, lat, height]
   * @param sImageInput Name of the image to render (reference to the local asset)
   * @param sName Name to assign to the icon
   * @param sDescription Description
   * @param iWidth  Draw size width in pixel (64 by default)
   * @param iHeight Draw size heigth in pixel (64 by default)
   * @returns 
   */
  drawPointWithImage = function (aiPositionInput: any[], sImageInput: string, sName: string, sDescription: string, iWidth?: number, iHeight?: number) {
    if (!aiPositionInput) {
      return null;
    }
    if (!sImageInput) {
      return null;
    }
    if (!sName) {
      return false;
    }
    if (!sDescription) {
      return false;
    }
    if (!iWidth) {
      iWidth = 64;
    }
    if (!iHeight) {
      iHeight = 64;
    }

    let oPoint = this.m_oWasdiGlobe.entities.add({
      name: sName,
      position: Cesium.Cartesian3.fromDegrees(aiPositionInput[0], aiPositionInput[1], aiPositionInput[2]),
      billboard: {
        image: sImageInput,
        width: iWidth,
        height: iHeight
      }, label: {
        text: sDescription,
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.CHARTREUSE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -9)
      }
    });

    return oPoint;
  }

  /**
   * Removes an entity from the globe
   * @param oEntity 
   * @returns 
   */
  removeEntity(oEntity: any) {
    if (!oEntity) {
      return false;
    }

    let oGlobe = this.m_oWasdiGlobe;
    oGlobe.entities.remove(oEntity);
    return true;
  }

  /**
   * Converts a bbox to a rectangle array
   * @param bbox String bbox in form Lat,Lon,Lat,Lon...
   * @returns Integer Array in form [Lon,Lat,Lon,Lat...]
   */
  fromBboxToRectangleArray(bbox: any) {
    // skip if there isn't the product bounding box
    if (!bbox) {
      return null;
    }

    let aiInvertedArraySplit = [];
    let asArraySplit = bbox.split(",");

    let iArraySplitLength = asArraySplit.length;

    if (iArraySplitLength < 10) return null;

    for (let iIndex = 0; iIndex < iArraySplitLength - 1; iIndex = iIndex + 2) {
      aiInvertedArraySplit.push(asArraySplit[iIndex + 1]);
      aiInvertedArraySplit.push(asArraySplit[iIndex]);
    }

    return aiInvertedArraySplit;
  }

  /**
   * Update the position of an entity in the globe
   * @param oEntity 
   * @param oNewPosition 
   */
  updateEntityPosition(oEntity: any, oNewPosition: any) {
    if (oEntity && oNewPosition) {
      oEntity.position = oNewPosition;
    }
  }

  /**
   * Get the array of the supported satellites
   * @returns 
   */
  getSatelliteTrackInputList() {
    let aoOutList = [
      {
        name: "SENTINEL1A",
        icon: "assets/icons/sat_01.svg",
        label: "S1A",
        description: "ESA Sentinel 1 A "
      },
      /*            {
                name : "SENTINEL1B",
                icon : "assets/icons/S1B.svg",
                label : "S1B",
                description : "ESA Sentinel 1 B"
            },*/
      {
        name: "COSMOSKY1",
        icon: "assets/icons/sat_02.svg",
        label: "CSK1",
        description: "ASI COSMO-SKYMED 1"
      },
      {
        name: "COSMOSKY2",
        icon: "assets/icons/sat_02.svg",
        label: "CSK2",
        description: "ASI COSMO-SKYMED 2"
      },
      {
        name: "COSMOSKY3",
        icon: "assets/icons/sat_02.svg",
        label: "CSK3",
        description: "ASI COSMO-SKYMED 3"
      },
      {
        name: "COSMOSKY4",
        icon: "assets/icons/sat_02.svg",
        label: "CSK4",
        description: "ASI COSMO-SKYMED 4"
      },
      {
        name: "LANDSAT8",
        icon: "assets/icons/sat_04.svg",
        label: "LS8",
        description: "NASA LANDSAT 8"
      },
/*      {
        name: "PROBAV",
        icon: "assets/icons/sat_05.svg",
        label: "PROBA-V",
        description: "PROBA VEGETATION"
      },*/
      {
        name: "GEOEYE",
        icon: "assets/icons/sat_06.svg",
        label: "GEOEYE",
        description: "GeoEye - Digital Globe"
      },
      {
        name: "WORLDVIEW2",
        icon: "assets/icons/sat_07.svg",
        label: "WORLDVIEW2",
        description: "WorldView - Digital Globe"
      }
    ];

    return aoOutList;
  }

  /********************************************ZOOM FUNCTIONS**********************************************/
  /**
   * Fly to Workspace Global Bounding Box.
   * Takes in input the list of Products of the Workspace.
   * bCreateRectangle can be undefined, null, true or false: it is not false the method will add
   * a bounding box rectangle for each product if it is still not on the globe.
   * In bCreateRectangle is false no rectangle will be added
   * @param aoProducts List of the workspace products
   * @returns {boolean}
   */
  flyToWorkspaceBoundingBox(aoProducts) {
    try {
      let aoArraySplit = [];
      let aoTotalArray = [];

      // Check we have products
      if (!aoProducts) {
        return false;
      }

      let iProductsLength = aoProducts.length;

      // For each product
      for (let iIndexProduct = 0; iIndexProduct < iProductsLength; iIndexProduct++) {

        if (!aoProducts[iIndexProduct]) {
          continue;
        }
        if (!aoProducts[iIndexProduct].bbox) {
          continue;
        }
        // Split bbox string
        aoArraySplit = aoProducts[iIndexProduct].bbox.split(",");

        let iArraySplitLength = aoArraySplit.length;
        if (iArraySplitLength < 10) continue;

        let bHasNan = false;
        for (let iValues = 0; iValues < aoArraySplit.length; iValues++) {
          if (isNaN(aoArraySplit[iValues])) {
            bHasNan = true;
            break;
          }
        }

        if (bHasNan) continue;

        aoTotalArray.push.apply(aoTotalArray, aoArraySplit);
      }

      let aoBounds = [];
      for (let iIndex = 0; iIndex < aoTotalArray.length - 1; iIndex = iIndex + 2) {
        aoBounds.push(new Cesium.Cartographic.fromDegrees(aoTotalArray[iIndex + 1], aoTotalArray[iIndex]));
      }
      let oWSRectangle = Cesium.Rectangle.fromCartographicArray(aoBounds);
      let oWSCenter = Cesium.Rectangle.center(oWSRectangle);

      //oGlobe.camera.setView({
      this.getGlobe().camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(oWSCenter.longitude, oWSCenter.latitude, this.GLOBE_WORKSPACE_ZOOM),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }
      });

      this.stopRotationGlobe();
      return true;
    }
    catch (e) {
      console.log(e);
      return e;
    }

  }

  /**
   * Add all the footprints of the products in the workspace to the globe
   * @param aoProducts 
   * @returns 
   */
  addAllWorkspaceRectanglesOnGlobe(aoProducts: any[]) {
    try {
      let oRectangle: any = null;
      let aoArraySplit: any[] = [];
      let aiInvertedArraySplit: any[] = [];

      let aoTotalArray: any[] = [];

      // Clear the previous footprints
      this.removeAllEntities();      

      // Check we have products
      if (!aoProducts) {
        return false;
      }

      let iProductsLength = aoProducts.length;

      // For each product
      for (let iIndexProduct = 0; iIndexProduct < iProductsLength; iIndexProduct++) {

        if (aoProducts[iIndexProduct]==null) continue;
        if (aoProducts[iIndexProduct].bbox==null) continue;

        // Split bbox string
        aoArraySplit = aoProducts[iIndexProduct].bbox.split(",");
        let iArraySplitLength = aoArraySplit.length;
        if (iArraySplitLength < 10) continue;

        let bHasNan = false;
        for (let iValues = 0; iValues < aoArraySplit.length; iValues++) {
          if (isNaN(aoArraySplit[iValues])) {
            bHasNan = true;
            break;
          }
        }

        if (bHasNan) continue;

        aoTotalArray.push.apply(aoTotalArray, aoArraySplit);

        // Get the array representing the bounding box
        aiInvertedArraySplit = this.fromBboxToRectangleArray(aoProducts[iIndexProduct].bbox);
        // Add the rectangle to the globe
        oRectangle = this.addRectangleOnGlobeParamArray(aiInvertedArraySplit);
        aoProducts[iIndexProduct].oRectangle = oRectangle;
        aoProducts[iIndexProduct].aBounds = aiInvertedArraySplit;
      }

      let aoBounds = [];
      for (let iIndex = 0; iIndex < aoTotalArray.length - 1; iIndex = iIndex + 2) {
        aoBounds.push(new Cesium.Cartographic.fromDegrees(aoTotalArray[iIndex + 1], aoTotalArray[iIndex]));
      }
      let oWSRectangle = Cesium.Rectangle.fromCartographicArray(aoBounds);
      let oWSCenter = Cesium.Rectangle.center(oWSRectangle);

      if (this.getGlobe()!=null) {
        this.getGlobe().camera.flyTo({
          destination: Cesium.Cartesian3.fromRadians(oWSCenter.longitude, oWSCenter.latitude, this.GLOBE_WORKSPACE_ZOOM),
          orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0
          }
        });  

        this.stopRotationGlobe();
      }

      return true;
    }
    catch (error) {
      console.log(error);
      return false;
    }
  }

  zoomOnLayerParamArray(aArray: any[]) {
    try {
      // Check input data
      if (!aArray) {
        return false;
      }
      if (!this.m_oWasdiGlobe) {
        return false;
      }

      // create a new points array
      let newArray = [];
      for (let iIndex = 0; iIndex < aArray.length - 1; iIndex += 2) {
        newArray.push(new Cesium.Cartographic.fromDegrees(aArray[iIndex + 1], aArray[iIndex]));
      }

      // Get a rectangle from the array
      let oZoom = Cesium.Rectangle.fromCartographicArray(newArray);
      let oWSCenter = Cesium.Rectangle.center(oZoom);

      // Fly there
      this.m_oWasdiGlobe.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(oWSCenter.latitude, oWSCenter.longitude, this.GLOBE_LAYER_ZOOM),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }
      });
      return true;
    }
    catch (e) {
      console.log(e);
      return false;
    }
  }

  zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox: any) {
    try {
      // Check the input
      if (!geoserverBoundingBox) {
        console.log("GlobeService.zoomBandImageOnGeoserverBoundingBox: geoserverBoundingBox is null");
        return false;
      }

      // Parse the bounding box
      geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, "");
      let oBoundingBox = JSON.parse(geoserverBoundingBox);
      if (!oBoundingBox) {
        console.log("GlobeService.zoomBandImageOnGeoserverBoundingBox: parsing bouning box is null");
        return false;
      }

      // Get the Globe
      let oGlobe = this.m_oWasdiGlobe;
      if (!oGlobe) {
        console.log("GlobeService.zoomBandImageOnGeoserverBoundingBox: globe is null");
        return false;
      }


      let oRectangle = Cesium.Rectangle.fromDegrees(oBoundingBox.minx, oBoundingBox.miny, oBoundingBox.maxx, oBoundingBox.maxy);
      let oCenter = Cesium.Rectangle.center(oRectangle);

      /* set view of globe*/
      oGlobe.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(oCenter.longitude, oCenter.latitude, this.GLOBE_LAYER_ZOOM),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }

      });

      return true;
    }
    catch (e) {
      console.log(e);
      return false;
    }
  }

  zoomBandImageOnBBox(sBbox) {
    try {
      if (!sBbox) {
        console.log("GlobeService.zoomBandImageOnBBOX: invalid bbox ");
        return;
      }

      if (!sBbox) {
        console.log("GlobeService.zoomBandImageOnBBOX: invalid bbox ");
        return;
      }

      let aiRectangle = this.fromBboxToRectangleArray(sBbox);

      if (aiRectangle) {
        this.zoomOnLayerParamArray(aiRectangle);
      }
    }
    catch (e) {
      console.log(e);
    }
  };

  zoomOnExternalLayer(oLayer: any) {
    try {
      if (!oLayer) {
        return false;
      }
      let oBoundingBox = (oLayer.BoundingBox[0].extent);

      if (!oBoundingBox) {
        return false;
      }

      let oGlobe = this.getGlobe();
      /* set view of globe*/
      oGlobe.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(oBoundingBox[0], oBoundingBox[1], oBoundingBox[2], oBoundingBox[3]),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

    /**
   * Adds a Layer to the 3D Map 
   * @param sLayerId Layer Id
   * @param sServer  Geoserver address. Of null the default one from Constant Service is taken
   * @returns True if all is fine, False in case of error
   */
    addLayerMap3DByServer(sLayerId: string, sServer: string) {
      
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sLayerId)) {
        return false;
      }

      if (FadeoutUtils.utilsIsStrNullOrEmpty(sServer)) {
        sServer = this.m_oConstantsService.getWmsUrlGeoserver();
      }
  
      var oGlobeLayers = this.getGlobeLayers();
  
      var oWMSOptions = { // wms options
        transparent: true,
        format: 'image/png'
      };
  
      // WMS get GEOSERVER
      var oProvider = new Cesium.WebMapServiceImageryProvider({
        url: sServer,
        layers: sLayerId,
        parameters: oWMSOptions
  
      });
  
      oGlobeLayers.addImageryProvider(oProvider);
  
      return true
    }  
}

