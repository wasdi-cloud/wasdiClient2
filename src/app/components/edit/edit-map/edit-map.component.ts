import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

//Service Imports
import { MapService } from 'src/app/services/map.service';
import { GlobeService } from 'src/app/services/globe.service';

//Leaflet Imports: 
import * as L from "leaflet";
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
declare let Cesium: any;

import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-edit-map',
  templateUrl: './edit-map.component.html',
  styleUrls: ['./edit-map.component.css']
})

export class EditMapComponent implements OnInit {

  /**
   * List of external WMS Layers added
   */
  m_aoExternalLayers: Array<any> = [];

  /**
   * Array of all the products in the Workspace. Used to fly on the workspace bbox 
   */
  
  private m_aoProducts: Array<any> = [];

  /**
   * Getter of the aoProduct Property
   */
  public get aoProducts(): Array<any> {
    return this.m_aoProducts;
  }

  /**
   * Setter of teh aoProduct Property
   */
  @Input() public set aoProducts(value: Array<any>) {
    this.m_aoProducts = value;
  }

  /**
   * Flag to know when the editor has loaded the Products list.
   * It is "read" from the editor component
   */
  private m_bIsLoadingProducts = true;

  /**
   * Getter of the Loading Products Property
   */
  public get bIsLoadingProducts() {
    return this.m_bIsLoadingProducts;
  }

  /**
   * Setter of the Loading Products Property
   */
  @Input() public set bIsLoadingProducts(value) {
    if (this.m_bIsLoadingProducts != value) {
      this.m_bIsLoadingProducts = value;
      if (this.m_b2DMapModeOn) {
        this.m_oGlobeService.addAllWorkspaceRectanglesOnGlobe(this.m_aoProducts);
        this.goWorkspaceHome();
      }
      else {
        this.m_oMapService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, "");
      }
    }
    
  }

  /**
   * List of the visible bands. Used to add and remove layers from 2d and 3d maps in case of a switch
   */
  @Input() m_aoVisibleBands: Array<any> = [];

  /**
   * Local Copy of the flag to determine if the 2d or 3d map is shown in the big panel.
   * By the default the 2D map is active.
   */
  m_b2DMapModeOn = true;

  /**
   * Getter of the aoProduct Property
   */
  public get b2DMapModeOn(): boolean {
    return this.m_b2DMapModeOn;
  }

  /**
   * Setter of the aoProduct Property
   */
  @Input() public set b2DMapModeOn(value: boolean) {
    this.m_b2DMapModeOn = value;
    this.switch2D3DMode()
  }  

  /**
   * Event triggered when the Map Mode changes from 2D to 3D and vice versa
   */
  @Output() m_b2DMapModeOutput = new EventEmitter();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  ngOnInit(): void {
    FadeoutUtils.verboseLog("EditMapComponent.ngOnInit: initializing")
    // As we enter, we go in 2D Mode by default
    this.init2DMode(false);
  }

  /**
   * Method to switch from 2D to 3D mode and vice versa
   */
  switch2D3DMode() {
    // Clear Both Map and Globe
    this.m_oGlobeService.clearGlobe();
    this.m_oMapService.clearMap();

    
    if (this.m_b2DMapModeOn === false) {
      // Changing the Displayed Map to the 3D Cesium Globe:
      this.init3DMode(true);
    }
    else {
      // Changing the Displayed Map to the 2D Leaflet Map:
      this.init2DMode(true);
    }

    this.goWorkspaceHome();
  }

  /**
   * Initializes the 2D Mode
   * @param bAddFootPrints true to add the workspace footprints to the small map
   */
  init2DMode(bAddFootPrints: boolean) {
    // Clear Both Map and Globe
    this.m_oGlobeService.clearGlobe();
    this.m_oMapService.clearMap();

    FadeoutUtils.verboseLog("EditMapComponent.init2DMode: moving 2D Map in big view")

    // Init the new one in the bigger div
    this.m_oMapService.initWasdiMap('bigMapContainer');

    // Notify the change
    this.m_b2DMapModeOutput.emit(true);

    //Set time out for Leaflet to animate:
    setTimeout(() => {
      this.m_oMapService.getMap().invalidateSize();

      // Load Visible Layers
      for (var iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
        // Check if it is a valid layer
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {
          // Add it to the 2D Map
          this.m_oMapService.addLayerMap2DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);            
        }
      }

      // Load External Layers
      for (var iExternals = 0; iExternals < this.m_aoExternalLayers.length; iExternals++) {
        // Check if it is valid
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoExternalLayers[iExternals].Name)) {
          // Add it to the 2D Map
          this.m_oMapService.addLayerMap2DByServer(this.m_aoExternalLayers[iExternals].Name, this.m_aoExternalLayers[iExternals].sServerLink);
        }
      }

      // TODO: this is a first step to try to make get pixel info work
      this.m_oMapService.m_oWasdiMap.on("click", oClickEvent => {
        console.log("Map Click " + oClickEvent.latlng.lat + " - " + oClickEvent.latlng.lng);
        //this.getLayerInfo()
      });
    }, 300);

    // Init the Globe in the small container
    this.m_oGlobeService.initGlobe('smallMapContainer')

    // If requested, add the foot print
    if (bAddFootPrints) {
      // Note: this have also the "fly" included
      this.m_oGlobeService.addAllWorkspaceRectanglesOnGlobe(this.m_aoProducts);
    }
  }

  /**
   * Initialize the 3D Mode
   * @param bAddFootPrints true to add the workspace footprints to the small map
   */
  init3DMode(bAddFootPrints: boolean) {

    // Changing the Displayed Map to the 3D Cesium Globe:
    FadeoutUtils.verboseLog("EditMapComponent.init3DMode: moving 3D Globe in big view")

    // Init the new one in the bigger div
    this.m_oGlobeService.initGlobe('bigMapContainer');

    // Notify the change
    this.m_b2DMapModeOutput.emit(false);

    //Load any exisiting layers into the Globe
    for (let iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
      
      // Check if it is a valid layer
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {
        // Add the layer to the 3D Map
        this.m_oGlobeService.addLayerMap3DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
      }
    }

    // Initialize the small 2D map in the Nav Tab
    this.m_oMapService.initWasdiMap("smallMapContainer");

    //Set time out for Leaflet to animate:
    setTimeout(() => {
      // Invalidate
      this.m_oMapService.getMap().invalidateSize();

      // Add foot prints (and send all to the workspace view)
      if (bAddFootPrints) {
        this.m_oMapService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, "");
        this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
      }
    }, 300);
  } 

  goWorkspaceHome() {
    if (this.m_b2DMapModeOn) {
      this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    } else {
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
  }

  getLayerInfo(wmsUrl: string, point: L.LatLng, bounds: L.LatLngBounds, layer: L.TileLayer.WMS) {
    const wmsParams = {
      ...layer.wmsParams,
      request: 'GetFeatureInfo',
      service: 'WMS',
      info_format: 'application/json',
      query_layers: layer.wmsParams.layers,
      feature_count: 10,
      bbox: ""
    };
  
    const lat = point.lat;
    const lng = point.lng;
    const bounds1: L.LatLngBounds = L.latLngBounds(L.latLng(lat - 0.1, lng - 0.1), L.latLng(lat + 0.1, lng + 0.1));
  
  
    //set BBox
    const boundsString = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
    const boundsString1 = [bounds1.getSouth(), bounds1.getWest(), bounds1.getNorth(), bounds1.getEast()].join(',');
  
    wmsParams.bbox = (wmsParams.version === '1.3.0') ? boundsString1 : bounds1.toBBoxString();
  
    //set size
    wmsParams.height = 101;
    wmsParams.width = 101;
  
    //set x/y or i/j
    wmsParams[wmsParams.version === '1.3.0' ? 'i' : 'x'] = Math.round(50);
    wmsParams[wmsParams.version === '1.3.0' ? 'j' : 'y'] = Math.round(50);
  
    //Set param version
    wmsParams[wmsParams.version === '1.3.0' ? 'crs' : 'srs'] = 'EPSG:4326';
  
  
    //build url with url and params
    const url = wmsUrl + L.Util.getParamString(wmsParams, wmsUrl)
  
    //load data from server
    return url;    
  }
}
