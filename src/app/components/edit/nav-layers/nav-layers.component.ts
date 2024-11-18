import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

//Import Services:
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { MapService } from 'src/app/services/map.service';
import { StylesDialogComponent } from 'src/app/components/edit/edit-toolbar/toolbar-dialogs/styles-dialog/styles-dialog.component';

//Import Models:
import { Band } from 'src/app/shared/models/band.model';

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

//Declare Leaflet:
declare const L: any;

@Component({
  selector: 'app-nav-layers',
  templateUrl: './nav-layers.component.html',
  styleUrls: ['./nav-layers.component.css'],
})
export class NavLayersComponent implements OnInit, OnChanges {
  //Set opacity to 100% by default
  m_iOpacityVal = 100;

  /**
   * Linked list of the visible bands
   */
  @Input() m_aoVisibleBands: Array<any> = [];
  /**
   * List of the products in the workspace
   */
  @Input() m_aoProducts: Array<any> = [];


  @Input() m_b2DMapMode: boolean = true;
  /**
   * Event to notify that the list of visible bands is changed
   */
  @Output() m_aoVisibleBandsChange = new EventEmitter();

  /**
   * Actually active tab
   */
  m_sActiveTab: string = 'nav';
  m_iOpacity: string;

  /**
   * 2D/3D Flag: is a property linked the flag in edit component
   */
  private m_b2DMapModeOn: boolean = true;

  public get b2DMapModeOn(): boolean {
    return this.m_b2DMapModeOn;
  }

  @Input() public set b2DMapModeOn(bValue: boolean) {
    this.m_b2DMapModeOn = bValue;
  }

  constructor(
    private m_oClipboard: Clipboard,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    //Only set active tab to layers if it is the FIRST band published
    if (
      this.m_aoVisibleBands !== undefined &&
      this.m_aoVisibleBands.length === 1
    ) {
      console.log('NavLayersComponent.ngOnChanges: switch to layers tab');
      this.setActiveTab('layers');
    }
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  /********** Band Visibility Options *********/
  /**
   * Handle Opacity input from opacity slider
   * @param iValue
   * @param sLayerId
   * @returns {void}
   */
  setOpacity(iValue, sLayerId): void {
    let iOpacity = iValue;
    let oMap = this.m_oMapService.getMap();
    let fPercentage = iOpacity / 100;

    oMap.eachLayer(function (layer) {
      if (
        layer.options.layers == 'wasdi:' + sLayerId ||
        layer.options.layers == sLayerId
      ) {
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
    let oRemovedBand;

    if (this.m_aoVisibleBands.length > 0) {
      iVisibleBandCount = this.m_aoVisibleBands.length;
    }
    for (let iIndex = 0; iIndex < iVisibleBandCount; ) {
      if (
        this.m_aoVisibleBands[iIndex].layerId == oBand.layerId &&
        this.m_aoVisibleBands[iIndex].name == oBand.name
      ) {
        oRemovedBand = oBand;
        this.m_aoVisibleBands.splice(iIndex, 1);
        this.m_aoVisibleBandsChange.emit({
          visibleBands: this.m_aoVisibleBands,
          removedBand: oRemovedBand,
        });
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
      console.log(
        'NavLayersComponent.removeBandImage: Error in removing band image'
      );
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

    this.removeBandImageFromVisibleList(oBand);
    return true;
  }

  /**
   * Remove Band Image from 2D Map by layer Id
   * @param sLayerId
   * @returns {void}
   */
  removeBandLayersIn2dMaps(sLayerId): void {
    let oMap2D = this.m_oMapService.getMap();
    oMap2D.eachLayer((layer) => {
      let sMapLayer = layer.options.layers;
      let sMapLayer2 = 'wasdi:' + layer.options.layers;

      if (sLayerId && sMapLayer === sLayerId) {
        oMap2D.removeLayer(layer);
      }
      if (sLayerId && sMapLayer2 === sLayerId) {
        oMap2D.removeLayer(layer);
      }
    });
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
    for (
      let iIndexLayer = 0;
      iIndexLayer < aoGlobeLayers.length;
      iIndexLayer++
    ) {
      let oLayer = aoGlobeLayers.get(iIndexLayer);
      if (
        FadeoutUtils.utilsIsStrNullOrEmpty(sLayerId) === false &&
        FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false &&
        oLayer.imageryProvider.layers === sLayerId
      ) {
        aoGlobeLayers.remove(oLayer);
        iIndexLayer = 0;
      } else {
        if (
          !FadeoutUtils.utilsIsObjectNullOrUndefined(
            oLayer.imageryProvider.layers
          )
        ) {
          let sMapLayer = 'wasdi:' + oLayer.imageryProvider.layers;
          if (
            FadeoutUtils.utilsIsStrNullOrEmpty(sLayerId) === false &&
            FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === false &&
            sMapLayer == sLayerId
          ) {
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
      this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(
        geoserverBoundingBox
      );
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
      return '';
    }

    let sGeoserverUrl: string = oBand.geoserverUrl;

    if (!sGeoserverUrl) {
      sGeoserverUrl = this.m_oConstantsService.getWmsUrlGeoserver();
    }

    if (sGeoserverUrl.endsWith('?')) {
      sGeoserverUrl = sGeoserverUrl.replace('ows?', 'wms?');
    } else {
      sGeoserverUrl = sGeoserverUrl.replace('ows', 'wms?');
    }

    sGeoserverUrl =
      sGeoserverUrl +
      'request=GetLegendGraphic&format=image/png&WIDTH=12&HEIGHT=12&legend_options=fontAntiAliasing:true;fontSize:10&LEGEND_OPTIONS=forceRule:True&LAYER=';
    sGeoserverUrl = sGeoserverUrl + 'wasdi:' + oBand.layerId;
    return sGeoserverUrl;
  }

  openStylesDialog(): void {
    this.m_oDialog.open(StylesDialogComponent, {
      height: '90vh',
      width: '90vw',
      maxWidth: '1500px',
    });
  }

  copyLayerId(sLayerId: string) {
    this.m_oClipboard.copy(sLayerId);
    let sMsg = this.m_oTranslate.instant('KEY_PHRASES.CLIPBOARD');
    this.m_oNotificationDisplayService.openSnackBar(sMsg);
  }
}
