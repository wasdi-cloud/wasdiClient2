import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';

//Angular Material Imports:
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

//Service Imports:
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { MapService } from 'src/app/services/map.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';

//Font Awesome Icons:
import { faDownload, faShareAlt, faTrash, faInfoCircle, faMap, faGlobeEurope, faCircleXmark, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

//Component Imports: 
import { ProductPropertiesDialogComponent } from './product-properties-dialog/product-properties-dialog.component';

//Leaflet Declaration:
import * as L from "leaflet";
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {
  @Input() productArray: Product[];
  @Input() map: any;
  @Input() m_sSearchString: string;
  @Output() m_aoVisibleBandsOutput = new EventEmitter();

  //font awesome icons: 
  faCircleCheck = faCircleCheck;
  faCircleX = faCircleXmark;
  faDownload = faDownload;
  faShare = faShareAlt;
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faGlobe = faGlobeEurope;
  faMap = faMap;

  m_oActiveBand;
  m_oActiveWorkspace;
  treeControl: NestedTreeControl<any>
  dataSource: MatTreeNestedDataSource<any>
  m_aoDisplayBands: any[];
  m_oDisplayMap: L.Map | null;
  m_aoVisibleBands: any[] = [];


  constructor(
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFileBufferService: FileBufferService,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
  ) {
    this.treeControl = new NestedTreeControl<any>(node => {
      if (node.bandsGroups) {
        return node.bandsGroups.bands
      }
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnChanges() {
    this.filterProducts();
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace()
  }

  filterProducts() {
    if (this.m_sSearchString) {
      let filteredProducts = []
      this.productArray.forEach(oProduct => {
        if (oProduct.fileName.indexOf(this.m_sSearchString) !== -1 || oProduct.name.indexOf(this.m_sSearchString) !== -1) {
          filteredProducts.push(oProduct)
        }
        if (oProduct.productFriendlyName) {
          if (oProduct.productFriendlyName.indexOf(this.m_sSearchString) !== -1) {
            filteredProducts.push(oProduct)
          }
        }
      })
      this.dataSource.data = filteredProducts
    } else {
      this.dataSource.data = this.productArray;
    }
  }

  hasChild(_: number, node: Product) {
    if (!node.bandsGroups) {
      return !!node
    } else {
      //Add id to child nodes (bands)
      if (node.bandsGroups.bands) {
        node.bandsGroups.bands.forEach(band => {
          band.nodeIndex = _
        })
      }
      return !!node.bandsGroups.bands && node.bandsGroups.bands.length > 0
    }
  };

  findProductByName(node) {
    let oFoundProduct = this.productArray.find(oProduct => oProduct.fileName === node.fileName);
    return oFoundProduct
  }

  /**
   * Called from the Product list tree and executes a download of the product
   * @param node 
   */
  downloadProduct(node: any) {
    if (node.fileName) {
      this.downloadProductByName(node.fileName)
    }
  }

  /**
   * Takes a file name and creates download file for the product
   * @param sFileName 
   * @returns boolean
   */
  downloadProductByName(sFileName: string) {
    if (!sFileName) {
      return false;
    }
    let sUrl: string;
    if (this.m_oConstantsService.getActiveWorkspace().apiUrl) {
      sUrl = this.m_oConstantsService.getActiveWorkspace().apiUrl;
    }

    this.m_oCatalogService.newDownloadByName(sFileName, this.m_oActiveWorkspace.workspaceId, sUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = sFileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
    return true;
  }

  openProductProperties(event: MouseEvent, node: any) {
    const oDialogRef = this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: {
        product: node
      },
      height: '85vh',
      width: '60vw'
    })
  }

  deleteProduct(node: any) {
    //Confirm Product Removal
    let bDeleteLayer = true;
    let bDeleteFile = true;

    //Get product from array
    let oFoundProduct = this.productArray.find(oProduct => oProduct.fileName === node.fileName);

    console.log(oFoundProduct);
    console.log(this.m_oActiveWorkspace.workspaceId)

    //Call m_oProductService.deleteProductFromWorkspace()
    this.m_oProductService.deleteProductFromWorkspace(oFoundProduct.fileName, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe(oResponse => {
      if (oResponse.boolValue) {

      }
      console.log(oResponse)
    })

    //in subscription, 

    //if deletion successful, reload product tree

    //if deletion unsuccessful show dialog

  }

  setBandImage(oBand) {
    this.m_oActiveBand = oBand;
    if (this.m_aoVisibleBands.indexOf(this.m_oActiveBand) !== -1) {
      this.removeBandImage(oBand)
    } else {
      this.openBandImage(oBand);
    }

  }

  /**
   * OPEN BAND IMAGE
   * Called from the tree to open a band
   * @param oBand
   */
  openBandImage(oBand) {
    let sFileName = this.productArray[oBand.nodeIndex].fileName;
    let bAlreadyPublished = oBand.published;
    this.m_oActiveBand = oBand;


    console.log(oBand)

    this.m_oFileBufferService.publishBand(sFileName, this.m_oActiveWorkspace.workspaceId, oBand.name).subscribe(oResponse => {
      console.log(oResponse);
      if (!bAlreadyPublished) {
        let sNotificationMsg = "PUBLISHING BAND";
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");
      }

      if (this.m_aoVisibleBands.length === 0) {

      }
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.messageResult != "KO" && FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.messageResult)) {
        //If the Band is already published: 
        if (oResponse.messageCode === "PUBLISHBAND") {
          console.log(oResponse.payload.geoserverBoundingBox);
          this.receivedPublishBandMessage(oResponse, this.m_oActiveBand);
        } else {
          this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
        }
        this.m_aoVisibleBands.push(this.m_oActiveBand);
        this.m_aoVisibleBandsOutput.emit(this.m_aoVisibleBands);
        this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(oResponse.payload.geoserverBoundingBox);
      } else {
        // var sMessage = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
        // utilsVexDialogAlertTop(sMessage + oBand.name);
        // oController.setTreeNodeAsDeselected(oBand.productName + "_" + oBand.name);
        let sNotificationMsg = "ERROR PUBLISHING BAND";
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");


      }
      //It is publishing; we will receieve a Rabbit Message
      if (oResponse.messageCode === "WAITFORRABBIT") {
        console.log("WAITING FOR RABBIT");
      }
    })

  }

  removeBandImageFromVisibleList(oBand) {
    let iVisibleBandCount = 0;

    if (this.m_aoVisibleBands.length > 0) {
      iVisibleBandCount = this.m_aoVisibleBands.length;
    }
    for (let iIndex = 0; iIndex < iVisibleBandCount;) {
      if (this.m_aoVisibleBands[iIndex].productName == oBand.productName && this.m_aoVisibleBands[iIndex].name == oBand.name) {
        this.m_aoVisibleBands.splice(iIndex, 1);
        this.m_aoVisibleBandsOutput.emit(this.m_aoVisibleBands);
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

  receivedPublishBandMessage(oMessage: any, oActiveBand: any) {
    let oPublishedBand = oMessage.payload;
    if (oPublishedBand === null || oPublishedBand === undefined) {
      console.log("EditorController.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }


    oActiveBand.bbox = oPublishedBand.bbox;
    oActiveBand.geoserverBoundingBox = oPublishedBand.geoserverBoundingBox;
    oActiveBand.geoserverUrl = oPublishedBand.geoserverUrl;
    oActiveBand.layerId = oPublishedBand.layerId;
    oActiveBand.published = true;
    oActiveBand.showLegend = false;


    let sColor = "#000";
    let sGeoserverBBox = oActiveBand.geoserverBoundingBox;
    this.productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, oActiveBand.bbox, oActiveBand.layerId);
    //if we are in 2D put it on the map
    this.addLayerMap2DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
    if (typeof oPublishedBand === undefined) {
      console.log("EditorController.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }

    oActiveBand.opacity = 100;


    return true;
  }

  productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, asBbox, sLayerId) {
    if (this.m_oMapService.isProductGeoreferenced(asBbox, sGeoserverBBox) === false) {
      let oRectangleBoundingBoxMap: L.Rectangle = this.m_oMapService.addRectangleByGeoserverBoundingBox(sGeoserverBBox, sColor, this.m_oMapService.getMap());

      if (oRectangleBoundingBoxMap) {
        oRectangleBoundingBoxMap.options.attribution = "wasdi:" + sLayerId;
      }
    }
  }

  addLayerMap2DByServer(sLayerId, sServer) {
    if (sLayerId == null) {
      return false;
    }
    if (sServer == null) {
      sServer = this.m_oConstantsService.getWmsUrlGeoserver();
    }

    let oMap = this.m_oMapService.getMap();

    let wmsLayer = L.tileLayer.wms(sServer, {
      layers: sLayerId,
      format: 'image/png',
      transparent: true,
      noWrap: true
    });
    wmsLayer.setZIndex(1000);
    wmsLayer.addTo(oMap);
    return true;

  }
}
