import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';
import { HttpEventType } from '@angular/common/http';

//Angular Material Imports:
import { MatDialog } from '@angular/material/dialog';
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
import { faDownload, faShareAlt, faTrash, faInfoCircle, faMap, faGlobeEurope, faCircleXmark, faCircleCheck, faBoxOpen, faSearch, faPlus, faChevronRight, faChevronDown, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

//Component Imports: 
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ImportDialogComponent } from '../edit-toolbar/toolbar-dialogs/import-dialog/import-dialog.component';
import { ProductPropertiesDialogComponent } from './product-properties-dialog/product-properties-dialog.component';

//Leaflet Declaration:
import * as L from "leaflet";
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Router } from '@angular/router';
import { FTPDialogComponent } from '../ftp-dialog/ftp-dialog.component';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { GlobeService } from 'src/app/services/globe.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
declare let Cesium: any;

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnChanges, OnInit {
  @Input() m_aoWorkspaceProductsList: Product[] = [];
  @Input() m_b2DMapMode: boolean = true;
  @Output() m_oProductArrayOutput = new EventEmitter();
  @Input() map: any;
  @Input() m_sSearchString: string;
  @Output() m_aoVisibleBandsOutput = new EventEmitter();
  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter();
  @Output() m_oDownloadProgress: EventEmitter<any> = new EventEmitter();

  @Input() m_bIsLoadingProducts: boolean = true;

  //font awesome icons: 
  faBox = faBoxOpen;
  faPlusCircle = faPlusCircle;
  faCircleCheck = faCircleCheck;
  faCircleX = faCircleXmark;
  faDownload = faDownload;
  faShare = faShareAlt;
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faGlobe = faGlobeEurope;
  faMap = faMap;
  faSearch = faSearch;
  faPlus = faPlus;

  m_oActiveBand;
  m_oActiveWorkspace;
  m_oProductsTreeControl: NestedTreeControl<any>
  m_oProductsTreeDataSource: MatTreeNestedDataSource<any>
  m_aoDisplayBands: any[];
  m_oDisplayMap: L.Map | null;
  m_aoVisibleBands: any[] = [];
  m_aoSelectedProducts: Array<any> = [];

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFileBufferService: FileBufferService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService,
    private m_oRouter: Router
  ) {
    this.m_oProductsTreeControl = new NestedTreeControl<any>(node => {
      if (node.bandsGroups) {
        return node.bandsGroups.bands
      }
    });
    this.m_oProductsTreeDataSource = new MatTreeNestedDataSource();
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log("ProductListComponent.ngOnChanges: call filter products ")
    this.filterProducts();
    console.log("ProductListComponent.ngOnChanges: done filter Products ")

    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  }

  filterProducts() {

    let aoFilteredProducts = this.m_aoWorkspaceProductsList;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined) {
      if (!FadeoutUtils.utilsIsStrNullOrEmpty) {

        console.log("ProductListComponent.filterProducts: m_sSearchString = " + this.m_sSearchString)

        let aoFilteredProducts = [];

        this.m_aoWorkspaceProductsList.forEach(oProduct => {
          if (oProduct.fileName.indexOf(this.m_sSearchString) !== -1 || oProduct.name.indexOf(this.m_sSearchString) !== -1) {
            aoFilteredProducts.push(oProduct)
          }
          if (oProduct.productFriendlyName) {
            if (oProduct.productFriendlyName.indexOf(this.m_sSearchString) !== -1) {
              aoFilteredProducts.push(oProduct)
            }
          }
        })
      }
    }

    console.log("ProductListComponent.filterProducts: filter done, assign the data source")

    this.m_oProductsTreeDataSource.data = aoFilteredProducts

    console.log("ProductListComponent.filterProducts: data source assigned")
  }

  trackByIndex(index: number): number {
    return index;
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
    let oFoundProduct = this.m_aoWorkspaceProductsList.find(oProduct => oProduct.fileName === node.fileName);
    return oFoundProduct
  }

  addProductToSelectedProducts(oEvent: any, oProduct: Product) {
    if (oEvent.currentTarget.checked === true) {
      //Add the Product to the Selected Products Array
      this.m_aoSelectedProducts.push(oProduct);
    } else {
      //Remove Product from the Selected Products Array
      this.m_aoSelectedProducts = this.m_aoSelectedProducts.filter((oProductInput) => {
        return oProductInput.fileName !== oProduct.fileName
      });
    }
  }

  selectAllProducts(oEvent) {
    if (oEvent.currentTarget.checked === true) {
      this.m_aoWorkspaceProductsList.forEach(oProduct => {
        oProduct['checked'] = true;
      })

      this.m_aoSelectedProducts = this.m_aoWorkspaceProductsList;
    } else {
      this.m_aoWorkspaceProductsList.forEach(oProduct => {
        oProduct['checked'] = false;
      })
      this.m_aoSelectedProducts = [];
    }
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

  downloadMultipleProducts() {
    this.m_aoSelectedProducts.forEach(oProduct => {
      console.log(oProduct);
      this.downloadProduct(oProduct);
    })
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

    this.m_oCatalogService.newDownloadByName(sFileName, this.m_oActiveWorkspace.workspaceId, sUrl).subscribe({
      next: oResponse => {
        if (oResponse.type === HttpEventType.DownloadProgress) {
          this.m_oDownloadProgress.emit({ downloadStatus: "incomplete", productName: sFileName })
        }
        if (oResponse.type === HttpEventType.Response) {
          console.log("donwload completed"); this.m_oDownloadProgress.emit({ downloadStatus: "complete", productName: sFileName })
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(oResponse.body);
          a.href = objectUrl;
          a.download = sFileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
          this.m_oNotificationDisplayService.openSnackBar("Download Complete", "Close", "right", "bottom");
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "Problem in getting Product Download");
      }
    });

    return true;
  }

  openProductProperties(event: MouseEvent, node: any) {
    const oDialogRef = this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: {
        product: node
      },
      height: '70vh',
      width: '60vw'
    })

    oDialogRef.afterClosed().subscribe(oDialogResponse => {
      this.emitProductInfoChange();
    })
  }

  openSendToFTP(oNode: any) {
    const oDialogRef = this.m_oDialog.open(FTPDialogComponent, {
      data: {
        product: oNode
      },
      height: '75vh',
      width: '60vw'
    });
    // oDialogRef.afterClosed().subscribe(oDialogResponse => {
    //   console.log()
    // })
  }

  deleteProduct(node: any) {

    let bDeleteLayer = true;
    let bDeleteFile = true;

    //Get product from array
    let oFoundProduct = this.m_aoWorkspaceProductsList.find(oProduct => oProduct.fileName === node.fileName);
    let sMessage = "Are you sure you wish to delete " + oFoundProduct.name;

    let dialogData = new ConfirmationDialogModel("Confirm Deletion", sMessage);

    //Open confirmation dialog for Product Removal
    let dialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    })

    dialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === false) {
        return false;
      } else {
        //Call m_oProductService.deleteProductFromWorkspace()
        this.m_oProductService.deleteProductFromWorkspace(oFoundProduct.fileName, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe(oResponse => {
          if (oResponse.boolValue) {
            this.m_oProductArrayOutput.emit(this.m_aoWorkspaceProductsList);
            return true;
          }
          return false
        });
        return true;
      }
    })

    //in subscription, 

    //if deletion successful, reload product tree

    //if deletion unsuccessful show dialog

  }

  deleteMultipleProducts() {
    let bDeleteLayer = true;
    let bDeleteFile = true;

    let sMessage = "Are you sure you wish to delete " + this.m_aoSelectedProducts.length + " products?";

    let oDialogData = new ConfirmationDialogModel("Confirm Removal", sMessage);
    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    })

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === false) {
        return;
      } else {
        this.m_aoSelectedProducts.forEach(oProduct => {
          this.m_oProductService.deleteProductFromWorkspace(oProduct.fileName, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe({
            next: oResponse => {
              if (oResponse.boolValue) {
                this.m_oProductArrayOutput.emit(this.m_aoWorkspaceProductsList);
                this.m_aoSelectedProducts = [];
                return true;
              } else {
                this.m_oAlertDialog.openDialog(4000, "Error deleting " + oProduct.fileName);
                return false;
              }
            },
            error: oError => {
              this.m_oAlertDialog.openDialog(4000, "Error deleting " + oProduct.fileName);
              return false;
            }
          })
        })
      }
    })
  }


  setBandImage(oBand: any, iIndex: number) {
    this.m_oActiveBand = oBand;
    if (this.m_aoVisibleBands.indexOf(this.m_oActiveBand) !== -1) {
      this.removeBandImage(oBand)
    } else {
      this.openBandImage(oBand, iIndex);
    }

  }

  /**
   * OPEN BAND IMAGE
   * Called from the tree to open a band
   * @param oBand
   */
  openBandImage(oBand: any, iIndex: number) {
    let sFileName = this.m_aoWorkspaceProductsList[iIndex].fileName;
    let bAlreadyPublished = oBand.published;
    this.m_oActiveBand = oBand;

    this.m_oFileBufferService.publishBand(sFileName, this.m_oActiveWorkspace.workspaceId, oBand.name).subscribe(oResponse => {
      if (!bAlreadyPublished) {
        let sNotificationMsg = "PUBLISHING BAND";
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");
      }

      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.messageResult != "KO" && FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.messageResult)) {
        //If the Band is already published: 
        if (oResponse.messageCode === "PUBLISHBAND") {
          this.receivedPublishBandMessage(oResponse, this.m_oActiveBand);

        } else {
          this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
        }
        this.m_oActiveBand['productName'] = oResponse.payload.productName
        this.m_aoVisibleBands.push(this.m_oActiveBand);

        this.m_aoVisibleBandsOutput.emit(this.m_aoVisibleBands);
        if (this.m_b2DMapMode === true) {

          this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(oResponse.payload.geoserverBoundingBox);
        } else {
          this.m_oGlobeService.zoomBandImageOnGeoserverBoundingBox(oResponse.payload.geoserverBoundingBox);
        }
      } else {
        // utilsVexDialogAlertTop(sMessage + oBand.name);
        // oController.setTreeNodeAsDeselected(oBand.productName + "_" + oBand.name);
        let sNotificationMsg = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
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

  receivedRabbitMessage(oMessage, oController) {
    // Check if the message is valid
    if (oMessage == null) return;

    // Check the Result
    if (oMessage.messageResult == "KO") {

      var sOperation = "null";
      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.messageCode) === false) sOperation = oMessage.messageCode;

      var sErrorDescription = "";

      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.payload) === false) sErrorDescription = oMessage.payload;
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sErrorDescription) === false) sErrorDescription = "<br>" + sErrorDescription;

      //  var oDialog = FadeoutUtils.utilsVexDialogAlertTop(oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_1") + sOperation + oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_2") + sErrorDescription);
      //  FadeoutUtils.utilsVexCloseDialogAfter(10000, oDialog);

      console.log(oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_1") + sOperation + oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_2") + sErrorDescription)

      if (oMessage.messageCode == "PUBLISHBAND") {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload) == false) {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload.productName) == false && FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload.bandName) == false) {
            var sNodeName = oMessage.payload.productName + "_" + oMessage.payload.bandName;

          }
        }
      }

      return;
    }

    // Switch the Code
    switch (oMessage.messageCode) {
      case "PUBLISH":
        oController.receivedPublishMessage(oMessage);
        break;
      case "PUBLISHBAND":
        oController.receivedPublishBandMessage(oMessage);
        break;
      case "DOWNLOAD":
      case "GRAPH":
      case "INGEST":
      case "MOSAIC":
      case "SUBSET":
      case "MULTISUBSET":
      case "RASTERGEOMETRICRESAMPLE":
      case "REGRID":
        oController.receivedNewProductMessage(oMessage);
        break;
      case "DELETE":
        //oController.getProductListByWorkspace();
        break;
    }

    console.log(oMessage);

    // FadeoutUtils.utilsProjectShowRabbitMessageUserFeedBack(oMessage, oController.m_oTranslate);
  }

  receivedPublishBandMessage(oMessage: any, oActiveBand: any) {
    let oPublishedBand = oMessage.payload;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oPublishedBand)) {
      console.log("EditorController.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }
    oActiveBand.bbox = oPublishedBand.boundingBox;
    oActiveBand.geoserverBoundingBox = oPublishedBand.geoserverBoundingBox;
    oActiveBand.geoserverUrl = oPublishedBand.geoserverUrl;
    oActiveBand.layerId = oPublishedBand.layerId;
    oActiveBand.published = true;
    oActiveBand.showLegend = false;

    let sColor = "#000";
    let sGeoserverBBox = oActiveBand.geoserverBoundingBox;
    this.productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, oActiveBand.bbox, oActiveBand.layerId);
    //if we are in 2D put it on the map
    if (this.m_b2DMapMode === true) {
      this.addLayerMap2DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
    } else {
      //If we are in 3D put it on the globe
      this.addLayerMap3DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);

    }
    if (typeof oPublishedBand === undefined) {
      console.log("EditorController.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }

    oActiveBand.opacity = 100;
    return true;
  }

  productIsNotGeoreferencedRectangle2DMap(sColor, sGeoserverBBox, asBbox, sLayerId) {
    if (this.m_oMapService.isProductGeoreferenced(asBbox, sGeoserverBBox) === false) {
      let oRectangleBoundingBoxMap: L.Rectangle = this.m_oMapService.addRectangleByGeoserverBoundingBox(sGeoserverBBox, "", this.m_oMapService.getMap());

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

  addLayerMap3DByServer(sLayerId, sServer) {
    if (sLayerId == null) return false;
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

    return true
  }

  readMetadata(sFileName: string) {
    this.m_oProductService.getProductMetadata(sFileName, this.m_oActiveWorkspace.workspaceId);
  }

  emitProductInfoChange() {
    this.m_oProductInfoChange.emit(true);
  }

  /********** Handlers for no Products **********/
  navigateToSearchPage() {
    this.m_oRouter.navigateByUrl('/search');
  }

  openImportDialog() {
    let oDialog = this.m_oDialog.open(ImportDialogComponent, {
      height: '40vh',
      width: '50vw'
    })
  }
}
