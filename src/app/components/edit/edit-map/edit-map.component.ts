import { Component, OnInit, OnDestroy, Output, Input, EventEmitter } from '@angular/core';
import maplibregl from 'maplibre-gl';

//Service Imports
import { MapEngineService } from 'src/app/services/map-engine/map-engine.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
    selector: 'app-edit-map',
    templateUrl: './edit-map.component.html',
    styleUrls: ['./edit-map.component.css'],
    standalone: false
})

export class EditMapComponent implements OnInit, OnDestroy {

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
      if (!value) {
        this.m_oMapEngineService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, '');
        this.goWorkspaceHome();
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
    this.switchProjection();
  }

  /**
   * Event triggered when the Map Mode changes from 2D to 3D and vice versa
   */
  @Output() m_b2DMapModeOutput = new EventEmitter();


  /**
   * Local Copy of the Feature Info Flag
  */
  m_bFeatureInfoMode = false;

  /**
   * Setter of the Feature Info Property
   */
  public setFeatureInfoMode(value: boolean) {
    this.m_bFeatureInfoMode = value;

    if (!this.m_bFeatureInfoMode) {
      if (this.m_oFeatureInfoMarker != null) {
        this.m_oFeatureInfoMarker.remove();
      }
    }
  }

  /**
   * Marker for the feature info
   */
  m_oFeatureInfoMarker = null;

  constructor(
    private m_oMapEngineService: MapEngineService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService) { }

  ngOnInit(): void {
    this.m_oMapEngineService.initMap('bigMapContainer');
    this.setupFeatureInfoClickHandler();
    this.m_b2DMapModeOutput.emit(true);
  }

  ngOnDestroy(): void {
    this.m_oMapEngineService.clearMap();
  }
  goWorkspaceHome() {
    this.m_oMapEngineService.flyToWorkspaceBoundingBox(this.m_aoProducts);
  }

  /**
   * Switch MapLibre projection between flat map and globe
   */
  switchProjection(): void {
    const oMap = this.m_oMapEngineService.getMap();
    if (!oMap) {
      return;
    }
    if (this.m_b2DMapModeOn) {
      oMap.setProjection({ type: 'mercator' });
      this.m_b2DMapModeOutput.emit(true);
    } else {
      oMap.setProjection({ type: 'globe' });
      this.m_b2DMapModeOutput.emit(false);
    }
  }

  setupFeatureInfoClickHandler(): void {
    const oMap = this.m_oMapEngineService.getMap();
    if (!oMap) {
      return;
    }

    oMap.on('click', (oClickEvent: any) => {
      if (!this.m_bFeatureInfoMode || this.m_aoVisibleBands.length === 0) {
        return;
      }

      let sWmsUrl = '';
      let sLayerIdList = '';

      for (let iLayers = 0; iLayers < this.m_aoVisibleBands.length; iLayers++) {
        const oLayer = this.m_aoVisibleBands[iLayers];
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sWmsUrl)) {
          sWmsUrl = oLayer.geoserverUrl.replace('ows', 'wms');
        }
        sLayerIdList += oLayer.layerId;
        if (iLayers < this.m_aoVisibleBands.length - 1) sLayerIdList += ',';
      }

      const oLngLat = oClickEvent.lngLat;
      const sFeatureInfoUrl = this.m_oMapEngineService.getWMSLayerInfoUrl(
        sWmsUrl, { lat: oLngLat.lat, lng: oLngLat.lng }, sLayerIdList
      );

      if (!sFeatureInfoUrl) {
        return;
      }

      if (this.m_oFeatureInfoMarker != null) {
        this.m_oFeatureInfoMarker.remove();
      }

      const sErrorMsg = this.m_oTranslate.instant('MAP_FEATURE_ERROR');
      this.m_oMapEngineService.getFeatureInfo(sFeatureInfoUrl).subscribe({
        next: (oResponse: any) => {
          if (oResponse != null) {
            try {
              const sContent = this.formatFeatureJSON(oResponse);
              this.m_oFeatureInfoMarker = new maplibregl.Popup()
                .setLngLat([oLngLat.lng, oLngLat.lat])
                .setHTML(sContent)
                .addTo(oMap);
            } catch (_oError) {
              this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, '', 'danger-snackbar');
            }
          }
        },
        error: () => {
          this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, '', 'danger-snackbar');
        }
      });
    });
  }

  formatFeatureJSON(oJSON: any): string {
    const asFeatureContent = oJSON.features.map((oFeature: any) => {
      const sProps = oFeature.properties instanceof Array
        ? oFeature.properties.map((oP: any) => `<li>Gray Index: ${oP.GRAY_INDEX}</li>`).join('')
        : `<li>Gray Index: ${oFeature.properties?.GRAY_INDEX}</li>`;
      return `<li>Type: ${oFeature.type}<ul>${sProps}</ul></li>`;
    });
    return '<ul>' + asFeatureContent.join('') + '</ul>';
  }
}
