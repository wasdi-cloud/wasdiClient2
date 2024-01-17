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

  m_aoExternalLayers: Array<any> = [];
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

      FadeoutUtils.verboseLog("EditMapComponent.switch2D3DMode: moving 3D Globe in big view")

      // Clean the old globe
      this.m_oGlobeService.clearGlobe();
      // Init the new one in the bigger div
      this.m_oGlobeService.initGlobe('CesiumContainerEdit');

      // Notify the change
      this.m_b2DMapModeOutput.emit(false);

      //Load any exisiting layers into the Globe
      for (let iIndexLayers = 0; iIndexLayers < this.m_aoVisibleBands.length; iIndexLayers++) {
        
        // Check if it is a valid layer
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoVisibleBands[iIndexLayers].layerId)) {
          this.m_oGlobeService.addLayerMap3DByServer(this.m_aoVisibleBands[iIndexLayers].layerId, this.m_aoVisibleBands[iIndexLayers].geoserverUrl);
        }
      }

      this.goWorkspaceHome();
    }
    else {

      FadeoutUtils.verboseLog("EditMapComponent.switch2D3DMode: moving 2D Map in big view")

      // Clean the old map
      this.m_oMapService.clearMap();
      // Init the new one in the bigger div
      this.m_oMapService.initWasdiMap('editMap');

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
        
        //  Add all bounding boxes to 3D Map
        this.m_oGlobeService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts);

        // Zoom on the workspace
        this.goWorkspaceHome();
      }, 300)
    }

  }

  goWorkspaceHome() {
    if (this.m_b2DMapModeOn) {
      this.m_oMapService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    } else {
      this.m_oGlobeService.flyToWorkspaceBoundingBox(this.m_aoProducts);
    }
  }
}
