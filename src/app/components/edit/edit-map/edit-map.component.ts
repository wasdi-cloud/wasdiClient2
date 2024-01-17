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
   * Flag to know when the editor has loaded the Products list
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
  @Output() m_b2DMapModeOutput = new EventEmitter();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  ngOnInit(): void {

    FadeoutUtils.verboseLog("EditMapComponent.ngOnInit: initializing")
    this.init2DMode(false);
  }

  switch2D3DMode() {
    this.m_b2DMapModeOn = !this.m_b2DMapModeOn;

    // Clear Both Map and Globe
    this.m_oGlobeService.clearGlobe();
    this.m_oMapService.clearMap();

    // Changing the Displayed Map to the 3D Cesium Globe:
    if (this.m_b2DMapModeOn === false) {
      this.init3DMode(true);
    }
    else {
      this.init2DMode(true);
    }

  }

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
      // Load Layers
      for (var iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
        // Check if it is a valid layer
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {
          this.m_oMapService.addLayerMap2DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);            
        }
      }

      // Load External Layers
      for (var iExternals = 0; iExternals < this.m_aoExternalLayers.length; iExternals++) {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoExternalLayers[iExternals].Name)) {
          this.m_oMapService.addLayerMap2DByServer(this.m_aoExternalLayers[iExternals].Name, this.m_aoExternalLayers[iExternals].sServerLink);
        }
      }

      console.log("EditMapComponent.init2DMode: Products Size = " + this.m_aoProducts.length);

      this.m_oGlobeService.initGlobe('smallMapContainer')

      if (bAddFootPrints) {
        this.m_oGlobeService.addAllWorkspaceRectanglesOnGlobe(this.m_aoProducts);
      }
    }, 300);
  }

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
        this.m_oGlobeService.addLayerMap3DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
      }
    }

    console.log("EditMapComponent.init3DMode: Products Size = " + this.m_aoProducts.length);

    this.m_oMapService.initWasdiMap("smallMapContainer");

    //Set time out for Leaflet to animate:
    setTimeout(() => {
      this.m_oMapService.getMap().invalidateSize();
      if (bAddFootPrints) {
        this.m_oMapService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, "");
        this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
        this.goWorkspaceHome();
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
}
