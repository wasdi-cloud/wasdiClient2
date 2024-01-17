import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, OnInit } from '@angular/core';

// Font Awesome Icon Imports:
import { faExpand, faList, faX } from '@fortawesome/free-solid-svg-icons';

//Import Services:
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { MapService } from 'src/app/services/map.service';

//Import Models:
import { Band } from 'src/app/shared/models/band.model';

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

//Declare Leaflet:
declare const L: any;

@Component({
  selector: 'app-nav-layers',
  templateUrl: './nav-layers.component.html',
  styleUrls: ['./nav-layers.component.css']
})
export class NavLayersComponent implements OnInit, OnChanges {
  //Font Awesome Icons:
  faExpand = faExpand;
  faList = faList;
  faX = faX;

  //Set opacity to 100% by default
  m_iOpacityVal = 100;

  @Input() m_b2DMapModeOn: boolean = true;
  @Input() m_aoVisibleBands: Array<any> = []
  @Input() m_aoProducts: Array<any> = [];
  @Output() m_aoVisibleBandsChange = new EventEmitter();


  m_sActiveTab: string = 'nav';
  m_iOpacity: string;

  mapOptions: any;
  m_oNavMap: any;
  m_oNavGlobe: any;
  layersControl: any;
  layersControlOptions: any = { position: 'bottomleft' };

  oController = this;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService
  ) { }

  ngOnInit(): void {
    console.log("NavLayersComponent.ngOnInit")
    this.initMaps();
  }


  ngOnChanges(): void {
    console.log("NavLayersComponent.ngOnChanges")
    //Only set active tab to layers if it is the FIRST band published
    if (this.m_aoVisibleBands !== undefined && this.m_aoVisibleBands.length === 1) {
      this.setActiveTab('layers');
    }
  }

  /**
   * Initializes the 2D and 3D maps 
   */
  initMaps() {
    // The main map is 2D or 3D?
    if (this.m_b2DMapModeOn === true && this.m_oNavGlobe === undefined) {
      // The big map is 2D: we need to show here the little navigation globe
      // clear the old globe (if present)
      this.m_oGlobeService.clearGlobe();

      // And create it in the small navigation tab
      console.log("NavLayersComponent.initMaps: call init Globe")
      this.m_oGlobeService.initGlobe('cesiumContainer2');

      //Add the Products to the globe on load: 
      this.m_oGlobeService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts);
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
    else {
      // The big map is 3d: here we need to show only the 2d map
      this.m_oMapService.clearMap();
      this.m_oMapService.initWasdiMap('navMap');

      //Set timeout with Arrow function to preserve `this` context within `setTimeout`
      setTimeout(() => {
        this.m_oMapService.getMap().invalidateSize();
        this.m_oMapService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, '');
        this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
      }, 500)
    }
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  /********** Band Visibility Options *********/
  /**
   * Handle Opacity input from opacity slider
   * @param event 
   * @param sLayerId 
   * @returns {void}
   */
  setOpacity(event, sLayerId): void {
    let iOpacity = event.srcElement.value;
    let oMap = this.m_oMapService.getMap();
    let fPercentage = iOpacity / 100;

    oMap.eachLayer(function (layer) {
      if (layer.options.layers == ("wasdi:" + sLayerId) || layer.options.layers == sLayerId) {
        layer.setOpacity(fPercentage);
      }
    });
  }

  /**
   * Remove band from list of Visible layers and emit to listeners
   * @param oBand 
   * @returns {void}
   */
  removeBandImageFromVisibleList(oBand): void {
    let iVisibleBandCount = 0;

    if (this.m_aoVisibleBands.length > 0) {
      iVisibleBandCount = this.m_aoVisibleBands.length;
    }
    for (let iIndex = 0; iIndex < iVisibleBandCount;) {
      if (this.m_aoVisibleBands[iIndex].layerId == oBand.layerId && this.m_aoVisibleBands[iIndex].name == oBand.name) {
        this.m_aoVisibleBands.splice(iIndex, 1);
        this.m_aoVisibleBandsChange.emit(this.m_aoVisibleBands);
        iVisibleBandCount--;
      } else {
        iIndex++;
      }
    }
  }

  /**
   * Remove Band Image from the map itself (either 2D OR 3D)
   * @param oBand 
   * @returns {boolean}
   */
  removeBandImage(oBand: any): boolean {
    if (!oBand) {
      console.log("NavLayersComponent.removeBandImage: Error in removing band image");
      return false;
    }
    
    let sLayerId = 'wasdi:' + oBand.layerId;

    if (this.m_b2DMapModeOn) {
      this.removeBandLayersIn2dMaps(sLayerId);
    }

    if (this.m_b2DMapModeOn === false) {
      this.removeBandLayersIn3dMaps(sLayerId);
      //If the layers isn't georeferenced remove the Corresponding rectangle
      this.removeRedSquareIn3DMap(sLayerId);
    }

    this.removeBandImageFromVisibleList(oBand)
    return true;
  }

  /**
   * Remove Band Image from 2D Map by layer Id
   * @param sLayerId 
   * @returns {void}
   */
  removeBandLayersIn2dMaps(sLayerId): void {
    let oMap2D = this.m_oMapService.getMap()
    oMap2D.eachLayer(layer => {
      let sMapLayer = layer.options.layers;
      let sMapLayer2 = "wasdi:" + layer.options.layers;

      if (sLayerId && sMapLayer === sLayerId) {
        oMap2D.removeLayer(layer);
      }
      if (sLayerId && sMapLayer2 === sLayerId) {
        oMap2D.removeLayer(layer);
      }
    })
  }

  /**
   * Remove Band Image from 3D Map by layer Id
   * @param sLayerId 
   * @returns {void}
   */
  removeBandLayersIn3dMaps(sLayerId): void {
    // We are in 3d Mode
    let aoGlobeLayers = this.m_oGlobeService.getGlobeLayers();

    //Remove band layer
    for (let iIndexLayer = 0; iIndexLayer < aoGlobeLayers.length; iIndexLayer++) {
      let oLayer = aoGlobeLayers.get(iIndexLayer);
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sLayerId) === false && FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false && oLayer.imageryProvider.layers === sLayerId) {
        aoGlobeLayers.remove(oLayer);
        iIndexLayer = 0;
      } else {

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer.imageryProvider.layers)) {
          let sMapLayer = "wasdi:" + oLayer.imageryProvider.layers;
          if (FadeoutUtils.utilsIsStrNullOrEmpty(sLayerId) === false && FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false && sMapLayer == sLayerId) {
            aoGlobeLayers.remove(oLayer);
            iIndexLayer = 0;
          }
        }
      }
    }
  }

  /**
   * Remove non-georeferenced entities from the map
   * @param sLayerId 
   * @returns {void}
   */
  removeRedSquareIn3DMap(sLayerId): void {
    this.m_oGlobeService.removeAllEntities();
  }

  /**
   * Reframe Band Image on the map (either in 2D OR 3D)
   * @param geoserverBoundingBox 
   * @returns {void}
   */
  zoomOnBandImage(geoserverBoundingBox): void {
    if (this.m_b2DMapModeOn === true) {
      this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(geoserverBoundingBox);
    }
  }

  /**
   * Show the layer legend for a selected band
   * @param oBand
   * @returns {void}
   */
  showLayerLegend(oBand: any): void {
    oBand.showLegend = !oBand.showLegend;
    oBand.legendUrl = this.getBandLegendUrl(oBand);
  }

  /**
   * Retrieve band layer legend url from server
   * @param oBand 
   * @returns {string}
   */
  getBandLegendUrl(oBand: Band): string {
    if (oBand === null) {
      return "";
    }

    let sGeoserverUrl: string = oBand.geoserverUrl;

    if (!sGeoserverUrl) {
      sGeoserverUrl = this.m_oConstantsService.getWmsUrlGeoserver();
    }

    if (sGeoserverUrl.endsWith("?")) {
      sGeoserverUrl = sGeoserverUrl.replace("ows?", "wms?");
    } else {
      sGeoserverUrl = sGeoserverUrl.replace("ows", "wms?");
    }

    sGeoserverUrl = sGeoserverUrl + "request=GetLegendGraphic&format=image/png&WIDTH=12&HEIGHT=12&legend_options=fontAntiAliasing:true;fontSize:10&LEGEND_OPTIONS=forceRule:True&LAYER=";
    sGeoserverUrl = sGeoserverUrl + "wasdi:" + oBand.layerId;
    return sGeoserverUrl;
  }
}
