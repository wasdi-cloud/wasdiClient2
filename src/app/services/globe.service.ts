import { Injectable } from '@angular/core';

//Import Environment file:
import { environment } from 'src/environments/environment';

//Import Fadeout Utilities:
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

//Declare Cesium:
declare let Cesium: any;

@Injectable({
  providedIn: 'root'
})
export class GlobeService {
  m_oWasdiGlobe: any = null;
  m_aoLayers: any[] = null;
  LONG_HOME: number = 0;
  LAT_HOME: number = 0;
  HEIGHT_HOME: number = 20000000; //zoom
  GLOBE_LAYER_ZOOM: number = 2000000;
  GLOBE_WORKSPACE_ZOOM: number = 4000000;
  oController: any;


  oGlobeOptions = {
    //imageryProvider : Cesium.createOpenStreetMapImageryProvider(),
    timeline: false,
    animation: false,
    baseLayerPicker: true,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    geocoder: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    homeButton: false,
    scene3DOnly: true
  }

  constructor() { this.oController = this; }

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
        this.m_oWasdiGlobe = new Cesium.Viewer(sGlobeDiv, oGlobeOptions);


        // Select OpenLayers and Cesium DEM Terrain by default
        this.m_oWasdiGlobe.baseLayerPicker.viewModel.selectedImagery = this.m_oWasdiGlobe.baseLayerPicker.viewModel.imageryProviderViewModels[6];
        this.m_oWasdiGlobe.baseLayerPicker.viewModel.selectedTerrain = this.m_oWasdiGlobe.baseLayerPicker.viewModel.terrainProviderViewModels[1];

        this.m_aoLayers = this.m_oWasdiGlobe.imageryLayers;

      } catch (error) {
        console.log("Error in Cesium Globe: " + error)
      }
    } else {
      //TODO ERROR  browser doesn't support WebGL
      console.log("Error in Cesium Globe: missing WebGl");
      // ALERT DIALOG
    }
  }

  clearGlobe() {
    if (this.m_oWasdiGlobe) {
      this.m_oWasdiGlobe.destroy();
      this.m_oWasdiGlobe = null;
    }
  }

  getGlobe() {
    return this.m_oWasdiGlobe;
  }

  getWorkspaceZoom() {
    return this.GLOBE_WORKSPACE_ZOOM;
  }

  getGlobeLayers = function () {
    return this.m_aoLayers;
  }

  getMapCenter() {
    //if(utilsIsObjectNullOrUndefined(this.m_oWasdiGlobe))
    //    return
    let windowPosition = new Cesium.Cartesian2(this.m_oWasdiGlobe.container.clientWidth / 2, this.m_oWasdiGlobe.container.clientHeight / 2);
    let pickRay = this.m_oWasdiGlobe.scene.camera.getPickRay(windowPosition);
    let pickPosition = this.m_oWasdiGlobe.scene.globe.pick(pickRay, this.m_oWasdiGlobe.scene);
    let pickPositionCartographic = this.m_oWasdiGlobe.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
    return [pickPositionCartographic.latitude * (180 / Math.PI), pickPositionCartographic.longitude * (180 / Math.PI)];
  }

  goHome() {
    this.m_oWasdiGlobe.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(this.LONG_HOME, this.LAT_HOME, this.HEIGHT_HOME),
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });
  }

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

  addRectangleOnGlobeBoundingBox(bbox) {
    // Get the array representing the bounding box
    let aiInvertedArraySplit = this.fromBboxToRectangleArray(bbox);

    // Add the rectangle to the globe
    let oRectangle = this.addRectangleOnGlobeParamArray(aiInvertedArraySplit);


    if (!oRectangle) {
      return null;
    }

    let redRectangle = this.m_oWasdiGlobe.entities.add({
      name: 'Red translucent rectangle with outline',
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(oRectangle[0], oRectangle[1], oRectangle[2], oRectangle[3]),
        material: Cesium.Color.RED.withAlpha(0.2),
        outline: true,
        outlineColor: Cesium.Color.RED
      }
    });

    return redRectangle;
  };

  addRectangleOnGLobeByGeoserverBoundingBox(geoserverBoundingBox, oColor) {
    try {
      if (!geoserverBoundingBox) {
        console.log("MapService.addRectangleByGeoserverBoundingBox: geoserverBoundingBox is null or empty");
        return;
      }
      if (!oColor) {
        oColor = Cesium.Color.RED;
      }
      geoserverBoundingBox = geoserverBoundingBox.replace(/\n/g, "");
      let oBoundingBox = JSON.parse(geoserverBoundingBox);
      // let bounds = [oBounds.maxy,oBounds.maxx,oBounds.miny,oBounds.minx];
      // let bounds = [oBounds.maxx,oBounds.maxy,oBounds.minx,oBounds.miny];
      let oRectangle = Cesium.Rectangle.fromDegrees(oBoundingBox.minx, oBoundingBox.miny, oBoundingBox.maxx, oBoundingBox.maxy);

      // let oRectangle = this.addRectangleOnGlobeParamArray(bounds);

      // let bounds = [ [oBounds.maxy,oBounds.maxx],[oBounds.miny,oBounds.minx] ];
      // let oRectangle = L.rectangle(bounds, {color: sColor, weight: 2}).addTo(this.m_oWasdiMap);
      let oReturnRectangle = this.m_oWasdiGlobe.entities.add({
        name: 'Red translucent rectangle with outline',
        rectangle: {
          coordinates: oRectangle,
          material: oColor.withAlpha(0.3),
          outline: true,
          outlineColor: oColor
        }
      });
      return oReturnRectangle;
    }
    catch (e) {
      console.log(e);
    }
    return null;
  }

  addRectangleOnGlobeParamArray(aArray: any[]) {
    console.log(aArray);
    // Safe Programming check
    if (!aArray) {
      return false;
    }
    if (!this.m_oWasdiGlobe) {
      return false;
    }

    try {

      // Create the new Polygon
      let oNewPolygon = {
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(aArray)),
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
        for (let j = 0; j < oEntity.polygon.hierarchy.getValue().positions.length; j++) {

          // Safe programming: index < of size
          if (j < oNewPolygon.hierarchy.positions.length) {
            // The position is the same?
            if (!oEntity.polygon.hierarchy.getValue().positions[j].equalsEpsilon(oNewPolygon.hierarchy.positions[j], 0.1)) {
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
          hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(aArray)),
          outline: true,
          outlineColor: Cesium.Color.RED.withAlpha(1),
          outlineWidth: 10,
          material: Cesium.Color.RED.withAlpha(0.2)
        }
      });

      return oRectangle;
    }
    catch (err) {
      console.log(err)
      return null;
    }
  }

  removeAllEntities() {
    let oGlobe = this.m_oWasdiGlobe;
    oGlobe.entities.removeAll();

  }

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
      //TODO ERROR  browser doesn't support WebGL
      console.log("Error in Cesium Globe miss WebGl");
      let errorMsg = "GURU MEDITATION<br>PLEASE UPDATE WEB GL<br>LINK: HTTPS://GET.WEBGL.ORG/";
    }
  }

  stopRotationGlobe() {
    this.m_oWasdiGlobe.clock.multiplier = 0;
    this.m_oWasdiGlobe.clock.canAnimate = true;
    this.m_oWasdiGlobe.clock.shouldAnimate = true;
  }

  startRotationGlobe(iRotationValue: number) {
    if (typeof iRotationValue !== "number") {
      return false;
    }
    this.m_oWasdiGlobe.clock.canAnimate = true;
    this.m_oWasdiGlobe.clock.shouldAnimate = true;
    this.m_oWasdiGlobe.clock.multiplier = iRotationValue * 600;
    return true;
  }

  drawOutLined(aPositions: any[], sColor: string, sName: string) {
    if (!aPositions) {
      return null;
    }
    if (!sName) {
      sName = "";
    }
    if (!sColor) {
      sColor = Cesium.Color.ORANGE;
    }

    let oOutLined = this.m_oWasdiGlobe.entities.add({
      name: sName,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(aPositions),
        width: 5,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: sColor,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK
        })
      }
    });

    return oOutLined;
  }

  drawGlowingLine(aPositions: any[], sColor: string, sName: string) {
    if (!aPositions) {
      return null;
    }
    if (!sName) {
      sName = "";
    }
    if (!sColor) {
      sColor = Cesium.Color.ORANGE;
    }

    let oGlowingLine = this.m_oWasdiGlobe.entities.add({
      name: sName,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(aPositions),
        width: 10,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: sColor
        })
      }
    });

    return oGlowingLine;
  }

  drawPointWithImage = function (aPositionInput: any[], sImageInput: string, sName: string, sDescription: string, iWidth?: number, iHeight?: number) {
    if (!aPositionInput) {
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
      position: Cesium.Cartesian3.fromDegrees(aPositionInput[0], aPositionInput[1], aPositionInput[2]),
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

  removeEntity(oEntity: any) {
    if (!oEntity) {
      return false;
    }

    let oGlobe = this.m_oWasdiGlobe;
    oGlobe.entities.remove(oEntity);
    return true;
  }

  fromBboxToRectangleArray(bbox: any) {
    // skip if there isn't the product bounding box
    if (!bbox) {
      return null;
    }

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
  }

  updateEntityPosition(oEntity: any, oNewPosition: any) {
    if (oEntity && oNewPosition) {
      //oEntity.go(oNewPosition);
      oEntity.position = oNewPosition;
    }
  }

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
      {
        name: "PROBAV",
        icon: "assets/icons/sat_05.svg",
        label: "PROBA-V",
        description: "PROBA VEGETATION"
      },
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

  addAllWorkspaceRectanglesOnMap(aoProducts: any[]) {
    try {
      let oRectangle: any = null;
      let aoArraySplit: any[] = [];
      let aiInvertedArraySplit: any[] = [];

      let aoTotalArray: any[] = [];

      // Check we have products
      if (!aoProducts) {
        return false;
      }

      // Clear the previous footprints
      this.removeAllEntities();

      let iProductsLength = aoProducts.length;

      // For each product
      for (let iIndexProduct = 0; iIndexProduct < iProductsLength; iIndexProduct++) {

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

  zoomBandImageOnBBox(bbox) {
    try {
      if (!bbox) {
        console.log("GlobeService.zoomBandImageOnBBOX: invalid bbox ");
        return;
      }

      if (!bbox) {
        console.log("GlobeService.zoomBandImageOnBBOX: invalid bbox ");
        return;
      }

      let aiRectangle = this.fromBboxToRectangleArray(bbox);

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
}

