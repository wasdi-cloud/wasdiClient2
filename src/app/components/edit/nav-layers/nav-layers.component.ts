import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { faExpand, faList, faX } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { MapService } from 'src/app/services/map.service';
import { Band } from 'src/app/shared/models/band.model';
declare const L: any;

@Component({
  selector: 'app-nav-layers',
  templateUrl: './nav-layers.component.html',
  styleUrls: ['./nav-layers.component.css']
})
export class NavLayersComponent implements OnChanges {
  //Font Awesome Icons:
  faExpand = faExpand;
  faList = faList;
  faX = faX;

  //Set opacity to 100% by default
  opacityVal = 100;

  @Input() m_b2DMapModeOn: boolean;
  @Input() m_aoVisibleBands
  @Input() m_aoProducts: any[] = [];
  @Output() m_aoVisibleBandsChange = new EventEmitter();

  m_sActiveTab: string = 'nav';
  m_oActiveBand: any;
  m_iOpacity: string;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oMapService: MapService
  ) { }

  ngOnChanges(): void {
    if (this.m_aoVisibleBands !== undefined) {
      this.setActiveTab('layers');
    }
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
  }

  setOpacity(event, sLayerId) {
    let iOpacity = event.srcElement.value;
    let oMap = this.m_oMapService.getMap();
    let fPercentage = iOpacity / 100;

    oMap.eachLayer(function (layer) {
      if (layer.options.layers == ("wasdi:" + sLayerId) || layer.options.layers == sLayerId) {
        console.log(layer.options.opacity)
        layer.setOpacity(fPercentage);
      }
    });
  }

  removeBandImageFromVisibleList(oBand) {
    let iVisibleBandCount = 0;

    if (this.m_aoVisibleBands.length > 0) {
      iVisibleBandCount = this.m_aoVisibleBands.length;
    }
    for (let iIndex = 0; iIndex < iVisibleBandCount;) {
      if (this.m_aoVisibleBands[iIndex].productName == oBand.productName && this.m_aoVisibleBands[iIndex].name == oBand.name) {
        this.m_aoVisibleBands.splice(iIndex, 1);
        this.m_aoVisibleBandsChange.emit(this.m_aoVisibleBands);
        iVisibleBandCount--;
      } else {
        iIndex++;
      }
    }
  }

  removeBandImage(oBand) {
    if (!oBand) {
      console.log("Error in removing band image");
      return false;
    }
    this.m_oActiveBand = null;
    let sLayerId = 'wasdi:' + oBand.layerId;

    //if(this.m_b2DMapModeOn) {}

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

    this.removeBandImageFromVisibleList(oBand)
    return true;
  }

  zoomOnBandImage(geoserverBoundindBox) {
    console.log(geoserverBoundindBox)
    this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(geoserverBoundindBox);
  }

  showLayerLegend(oBand) {
    oBand.showLegend = !oBand.showLegend;
    oBand.legendUrl = this.getBandLegendUrl(oBand);
  }

  getBandLegendUrl(oBand: Band) {
    if (oBand === null) {
      return "";
    }

    let sGeoserverUrl = oBand.geoserverUrl;

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

    console.log(sGeoserverUrl);
    return sGeoserverUrl;
  }
}