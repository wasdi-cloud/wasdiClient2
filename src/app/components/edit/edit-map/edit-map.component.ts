import { Component, OnChanges, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';

//Service Imports
import { MapService } from 'src/app/services/map.service';
import { GlobeService } from 'src/app/services/globe.service';

//Font Awesome Icon Improts: 
import { faGlobeAfrica, faHome, faInfoCircle, faLocationArrow, faMap, faNavicon } from '@fortawesome/free-solid-svg-icons';

//Leaflet Imports: 
import Geocoder from 'leaflet-control-geocoder';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
declare let Cesium: any;

import * as L from "leaflet";
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-edit-map',
  templateUrl: './edit-map.component.html',
  styleUrls: ['./edit-map.component.css']
})

export class EditMapComponent implements OnInit {
  //Font Awesome Imports
  faHome = faHome;
  faArrow = faLocationArrow;
  faNavicon = faNavicon;
  faInfo = faInfoCircle;
  faGlobe = faGlobeAfrica;
  faMap = faMap;

  m_aoProductsLayersIn3DMapArentGeoreferenced: Array<any> = [];
  m_aoExternalLayers: Array<any> = [];
  m_oActiveBand: any = null;
  m_oSearchControl: Geocoder = new Geocoder;
  m_oMapOptions: any;
  m_oLayersControl: any;
  m_b2DMapModeOn = true;

  @Input() m_aoProducts: Array<any> = [];
  @Input() m_aoVisibleBands: Array<any> = [];
  @Output() m_b2DMapModeOutput = new EventEmitter();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  ngOnInit(): void {

    FadeoutUtils.verboseLog("EditMapComponent.ngOnInit: initializing")

    this.m_oMapService.initWasdiMap('editMap');
    this.m_oLayersControl = this.m_oMapService.m_oLayersControl;
  }

  switch2D3DMode() {
    this.m_b2DMapModeOn = !this.m_b2DMapModeOn;

    // Changing the Displayed Map to the 3D Cesium Globe:
    if (this.m_b2DMapModeOn === false) {

      this.m_oGlobeService.clearGlobe();
      console.log("EditMapComponent.switch2D3DMode: call init Globe")
      this.m_oGlobeService.initGlobe('CesiumContainerEdit');

      this.m_b2DMapModeOutput.emit(false);

      //Load any exisiting layers onto the Globe
      for (let iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
        // Check if it is a valid layer
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {

          var sGeoserverBBox = this.m_aoVisibleBands[iIndexLayers].geoserverBoundingBox;

          let oRectangleIsNotGeoreferencedProduct = this.m_oGlobeService.productIsNotGeoreferencedRectangle3DMap(sGeoserverBBox, this.m_aoVisibleBands[iIndexLayers].bbox, this.m_aoVisibleBands[iIndexLayers].layerId);

          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangleIsNotGeoreferencedProduct) === false) {
            this.addLayerMap3DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
            let oLayer3DMap = {
              id: this.m_aoVisibleBands[iIndexLayers].layerId,
              rectangle: oRectangleIsNotGeoreferencedProduct
            };
            this.m_aoProductsLayersIn3DMapArentGeoreferenced.push(oLayer3DMap);
          } else {
            this.addLayerMap3DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
          }
        }

      }
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
    else {
      this.m_oMapService.clearMap('editMap');
      this.m_oMapService.initWasdiMap('editMap');
      this.m_b2DMapModeOutput.emit(true);
      //Set time out for Leaflet to animate:
      setTimeout(() => {
        this.m_oMapService.getMap().invalidateSize();
        // Load Layers
        for (var iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
          // Check if it is a valid layer
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {
            var sColor = "#f22323";
            var sGeoserverBBox = this.m_aoVisibleBands[iIndexLayers].geoserverBoundingBox;
            this.m_oMapService.productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, this.m_aoVisibleBands[iIndexLayers].bbox, this.m_aoVisibleBands[iIndexLayers].layerId);
          }
          this.addLayerMap2DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
        }

        // Load External Layers
        for (var iExternals = 0; iExternals < this.m_aoExternalLayers.length; iExternals++) {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoExternalLayers[iExternals].Name)) {
            this.addLayerMap2DByServer(this.m_aoExternalLayers[iExternals].Name, this.m_aoExternalLayers[iExternals].sServerLink);
          }
        }
        //  Add all bounding boxes to 3D Map
        this.m_oGlobeService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts);
        // Zoom on the active band
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveBand) === false) {
          this.m_oGlobeService.zoomBandImageOnGeoserverBoundingBox(this.m_oActiveBand.geoserverBoundingBox);
          this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(this.m_oActiveBand.geoserverBoundingBox);

        } else {
          // Zoom on the workspace
          this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
        }
      }, 300)
    }

  }



  addLayerMap2DByServer(sLayerId, sServer) {
    // Check input data
    if (sLayerId == null) return false;
    if (sServer == null) sServer = this.m_oConstantsService.getWmsUrlGeoserver();

    var oMap = this.m_oMapService.getMap();

    var wmsLayer = L.tileLayer.wms(sServer, {
      layers: sLayerId,
      format: 'image/png',
      transparent: true,
      noWrap: true
    });
    wmsLayer.setZIndex(1000);//it set the zindex of layer in map
    wmsLayer.addTo(oMap);
    return true;
  }

  addLayerMap3DByServer(sLayerId: string, sServer: string) {
    if (sServer == null) sServer = this.m_oConstantsService.getWmsUrlGeoserver();

    var oGlobeLayers = this.m_oGlobeService.getGlobeLayers();

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
  }

  goWorkspaceHome() {
    if (this.m_b2DMapModeOn) {
      this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    } else {
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
  }
}
