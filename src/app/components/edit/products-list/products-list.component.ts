import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';
import { HttpEventType } from '@angular/common/http';

//Angular Material Imports:
import { MatDialog } from '@angular/material/dialog';

//Service Imports:
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { MapService } from 'src/app/services/map.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

//Component Imports: 
import { ImportDialogComponent } from '../edit-toolbar/toolbar-dialogs/import-dialog/import-dialog.component';
import { ProductPropertiesDialogComponent } from './product-properties-dialog/product-properties-dialog.component';

//Leaflet Declaration:
import * as L from "leaflet";
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Router } from '@angular/router';
import { FTPDialogComponent } from '../ftp-dialog/ftp-dialog.component';
import { GlobeService } from 'src/app/services/globe.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsQueueService } from 'src/app/services/notifications-queue.service';

declare let Cesium: any;

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnChanges, OnInit {

  /**
   * List of products in the workspace, received from the API
   */
  @Input() m_aoWorkspaceProductsList: Product[] = [];

  /**
   * Flag to know if we are in 2D or 3D Mode: used to zoom on a layer after publish band
   */
  @Input() m_b2DMapMode: boolean = true;

  /**
   * Flag to know if the products are still loading or not
   */
  @Input() m_bIsLoadingProducts: boolean = true;

  /**
   * Search String filter
   */
  m_sSearchString: string = "";

  /**
   * List of the visible layers
   */
  @Input() m_aoVisibleBands: any[] = [];

  /**
   * Event to notify that the list of products changed (ie deleted a product?)
   */
  @Output() m_oProductArrayOutput = new EventEmitter();

  /**
   * Event to notify the change of Visible Layers
   */
  @Output() m_aoVisibleBandsOutput = new EventEmitter();

  /**
   * Event to notify that the properties of a product are changed
   */
  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter();

  /**
   * Event to notify about on going downloads
   */
  @Output() m_oDownloadProgress: EventEmitter<any> = new EventEmitter();

  /**
   * Flag to send filtered products length to parent
   */
  @Output() m_iFilteredProducts: EventEmitter<number> = new EventEmitter();

  /**
   * Array of (potentially) filtered products to show
   */
  m_aoFilteredProducts: any[] = [];
  /**
   * Active Workspace, used mainly as argument to different API services
   */
  m_oActiveWorkspace: any;
  /**
   * List of selected Products
   */
  m_aoSelectedProducts: Array<any> = [];
  /**
   * Flag to know if the Workspace is in read only mode or not
   */
  m_bIsReadOnly: boolean = true;

  /**
   * Message hook to receive the Publish Band Message from Rabbit
   */
  m_iHookIndex: number = -1;

  /**
   * Flag to track whether or not a search has been executed (filtering products);
   */
  m_bSearchExecuted: boolean = false;

  /**
   * Counter to track the amount of times the "sort" button has been clicked (max 3);
   */
  m_iSortClick: number = 0;

  /** 
   * Array containing file names for selected products
  */
  m_asSelectedProducts: Array<string> = [];


  constructor(
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
  ) { }

  /**
   * Initializes the Component
   */
  ngOnInit() {
    // Register the handler for publis band
    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook("PUBLISHBAND",
      this,
      this.publishBandMessageHook, false);

    // Save the reference to the active workspace
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  }

  ngOnChanges() {
    // If we have products try to filter
    if (this.m_aoWorkspaceProductsList != null) {
      if (this.m_aoWorkspaceProductsList.length > 0) {
        this.filterProducts();
      }
      else {
        this.m_aoFilteredProducts = [];
      }
    }
    else {
      this.m_aoFilteredProducts = [];
    }
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
  }

  /**
   * Keep clean: remove the message hook when we exit
   */
  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }

  /**
   * Search a Band Object from the the name of the product and of the band
   * @param sProductName Name of the product
   * @param sBandName Name of the band
   * @returns Band Object
   */
  getBandByProductAndBandName(sProductName, sBandName) {
    if (this.m_aoWorkspaceProductsList != null) {

      for (let iProducts = 0; iProducts < this.m_aoWorkspaceProductsList.length; iProducts++) {
        let oProduct = this.m_aoWorkspaceProductsList[iProducts];

        if (oProduct.name == sProductName) {
          let aoBands = oProduct.bandsGroups.bands;

          for (let iBands = 0; iBands < aoBands.length; iBands++) {
            if (aoBands[iBands].name == sBandName) {
              return aoBands[iBands];
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * We received a publish band rabbit message!
   * @param oRabbitMessage Rabbit Message
   * @param oController Reference to this controller (in this call "this" is rabbit service so we need the reference to our original controller!)
   */
  publishBandMessageHook(oRabbitMessage, oController) {
    // Get the payload
    let oPublishedBand = oRabbitMessage.payload;
    // Find the band object
    let oBand = oController.getBandByProductAndBandName(oPublishedBand.productName, oPublishedBand.bandName);
    // Call received Publish Band Message
    oController.receivedPublishBandMessage(oRabbitMessage, oBand);
  }



  filterProducts() {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoWorkspaceProductsList)) {
      if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sSearchString)) {

        FadeoutUtils.verboseLog("ProductList.ngOnChanges: filtering products");

        let aoFiltered = [];

        this.m_aoWorkspaceProductsList.forEach(oProduct => {
          if (oProduct.fileName.toLowerCase().indexOf(this.m_sSearchString.toLowerCase()) !== -1 || oProduct.name.toLowerCase().indexOf(this.m_sSearchString.toLowerCase()) !== -1) {
            aoFiltered.push(oProduct)
          }
          else if (oProduct.productFriendlyName) {
            if (oProduct.productFriendlyName.toLowerCase().indexOf(this.m_sSearchString.toLowerCase()) !== -1) {
              aoFiltered.push(oProduct)
            }
          }
        });

        this.m_aoFilteredProducts = aoFiltered;
        this.m_bIsLoadingProducts = false;
      } else {
        this.m_aoFilteredProducts = this.m_aoWorkspaceProductsList;
      }
    }
    else {
      this.m_aoFilteredProducts = [];
      this.m_bIsLoadingProducts = false;
    }

    this.m_iFilteredProducts.emit(this.m_aoFilteredProducts.length);
  }

  /**
   * Handle the click on the select (de-select) all button
   * @param oEvent 
   */
  selectAllProducts(oEvent) {
    if (oEvent.currentTarget.checked === true) {
      this.m_aoFilteredProducts.forEach(oProduct => {
        oProduct['checked'] = true;
      })

      this.m_aoSelectedProducts = this.m_aoFilteredProducts;
    } else {
      this.m_aoFilteredProducts.forEach(oProduct => {
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

  /**
   * Called from the Product List tree when the user wants to download many products at once.
   */
  downloadMultipleProducts() {
    let oController = this;
    this.m_asSelectedProducts.forEach(oProduct => {
      oController.downloadProductByName(oProduct);
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
          this.m_oDownloadProgress.emit({ downloadStatus: "complete", productName: sFileName })
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
        this.m_oNotificationDisplayService.openAlertDialog("There was an error dowloading the product");
      }
    });

    return true;
  }

  /**
   * Open the Product Properties Dialog
   * @param event 
   * @param node 
   */
  openProductProperties(event: MouseEvent, node: any) {
    const oDialogRef = this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: {
        product: node
      },
      height: '70vh',
      minWidth: '50vw'
    })

    oDialogRef.afterClosed().subscribe(oDialogResponse => {
      this.emitProductInfoChange();
    })
  }

  /**
   * Open the send to ftp dialog
   * @param oNode 
   */
  openSendToFTP(oNode: any) {
    const oDialogRef = this.m_oDialog.open(FTPDialogComponent, {
      data: {
        product: oNode
      },
      height: '75vh',
      width: '60vw'
    });
  }

  /**
   * Delete Product command: ask for confirmation and, in case, calls the API to delete a product
   * @param node 
   */
  deleteProduct(node: any) {

    let bDeleteLayer = true;
    let bDeleteFile = true;

    //Get product from array
    let oFoundProduct = this.m_aoWorkspaceProductsList.find(oProduct => oProduct.fileName === node.fileName);
    let sMessage = "Are you sure you wish to delete " + oFoundProduct.name;

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sMessage);

    bConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === false) {
        return false;
      }
      else {
        //Call the API
        this.m_oProductService.deleteProductFromWorkspace(oFoundProduct.fileName, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe(oResponse => {
          if (oResponse.boolValue) {
            this.m_oProductArrayOutput.emit(this.m_aoWorkspaceProductsList);
            return true;
          }
          return false
        });
        return true;
      }
    });
    //in subscription, 

    //if deletion successful, reload product tree

    //if deletion unsuccessful show dialog
  }

  /**
   * Delete Multiple products (ask for confirmation before)
   */
  deleteMultipleProducts() {
    let bDeleteLayer = true;
    let bDeleteFile = true;

    let sMessage = "Are you sure you wish to delete " + this.m_asSelectedProducts.length + " products?";

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sMessage);

    bConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === false) {
        return;
      } else {
        this.m_asSelectedProducts.forEach(oProduct => {
          this.m_oProductService.deleteProductFromWorkspace(oProduct, this.m_oActiveWorkspace.workspaceId, bDeleteFile, bDeleteLayer).subscribe({
            next: oResponse => {
              if (oResponse.boolValue) {
                this.m_oProductArrayOutput.emit(this.m_aoWorkspaceProductsList);
                this.m_asSelectedProducts = [];
                return true;
              } else {
                this.m_oNotificationDisplayService.openAlertDialog("Error deleting " + oProduct);
                return false;
              }
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Error deleting " + oProduct);
              return false;
            }
          })
        })
      }
    })
  }

  /**
   * Handle the click on a band to add or remove it from the layer list
   * @param oBand 
   * @param iIndex 
   */
  handleBandSelection(oBand: any, iIndex) {
    if (this.m_aoVisibleBands.indexOf(oBand) !== -1) {
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

    this.m_oFileBufferService.publishBand(sFileName, this.m_oActiveWorkspace.workspaceId, oBand.name).subscribe(oResponse => {

      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.messageResult != "KO" && FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.messageResult)) {
        //If the Band is already published: 
        if (oResponse.messageCode === "PUBLISHBAND") {
          this.receivedPublishBandMessage(oResponse, oBand);
        }
        else {
          let sNotificationMsg = "PUBLISHING BAND";
          this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");

          this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
        }
      }
      else {
        let sNotificationMsg = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");
      }
    })

  }

  /**
   * Removes the band from the internal list of m_aoVisibleBandsOutput that is used to draw the
   * layers panel
   * @param oBand 
   */
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

  /**
   * Removes a Band from the map
   * @param oBand 
   * @returns 
   */
  removeBandImage(oBand) {
    if (!oBand) {
      console.log("ProductsListComponent.Error in removing band image");
      return false;
    }

    let sLayerId = 'wasdi:' + oBand.layerId;

    let oMap2D = this.m_oMapService.getMap()

    oMap2D.eachLayer(oLayer => {
      let sMapLayer = oLayer.options.layers;
      let sMapLayer2 = "wasdi:" + oLayer.options.layers;

      if (sLayerId && sMapLayer === sLayerId) {
        oMap2D.removeLayer(oLayer);
      }
      if (sLayerId && sMapLayer2 === sLayerId) {
        oMap2D.removeLayer(oLayer);
      }
    })

    this.removeBandImageFromVisibleList(oBand)
    return true;
  }

  /**
   * Called when a band can be visualized on the map. 
   * If a band has already been published, the API directly return this view model.
   * If not WASDI triggers the publish band operation that will send this rabbit message when received.
   * 
   * @param oMessage 
   * @param oActiveBand 
   * @returns 
   */
  receivedPublishBandMessage(oMessage: any, oActiveBand: any) {
    let oPublishedBand = oMessage.payload;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oPublishedBand)) {
      console.log("ProductListComponent.receivedPublishBandMessage: Error Published band is empty...");
      return false;
    }
    oActiveBand.bbox = oPublishedBand.boundingBox;
    oActiveBand.geoserverBoundingBox = oPublishedBand.geoserverBoundingBox;
    oActiveBand.geoserverUrl = oPublishedBand.geoserverUrl;
    oActiveBand.layerId = oPublishedBand.layerId;
    oActiveBand.published = true;
    oActiveBand.showLegend = false;
    oActiveBand['bVisibleNow'] = true;

    oActiveBand['productName'] = oPublishedBand.productName
    this.m_aoVisibleBands.push(oActiveBand);

    this.m_aoVisibleBandsOutput.emit(this.m_aoVisibleBands);

    let bAutoZoom = false;

    if (this.m_aoVisibleBands.length == 1) {
      bAutoZoom = true;
    }

    if (this.m_b2DMapMode === false) {
      //if we are in 3D put the layer on the globe
      this.m_oGlobeService.addLayerMap3DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
      if (bAutoZoom) this.m_oGlobeService.zoomBandImageOnGeoserverBoundingBox(oPublishedBand.geoserverBoundingBox);
    } else {
      //if we are in 2D put it on the map
      this.m_oMapService.addLayerMap2DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
      if (bAutoZoom) this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(oPublishedBand.geoserverBoundingBox);
    }

    return true;
  }

  /**
   * Get Product Metadata calling the API
   * 
   * @param sFileName 
   */
  readMetadata(sFileName: string) {
    this.m_oProductService.getProductMetadata(sFileName, this.m_oActiveWorkspace.workspaceId);
  }

  /**
   * Trigger the Product Info Change
   */
  emitProductInfoChange() {
    this.m_oProductInfoChange.emit(true);
  }

  /********** Handlers for no Products **********/

  /**
   * Moves the user in the Search Section
   */
  navigateToSearchPage() {
    this.m_oRouter.navigateByUrl('/search');
  }

  /**
   * Open the Import Dialog
   */
  openImportDialog() {
    this.m_oDialog.open(ImportDialogComponent, {
      height: '40vh',
      width: '50vw'
    })
  }

  /**
   * Track By Function needed by angular to determine the uniquess of an item in the list
   * This is used for the product list
   * 
   * @param iIndex 
   * @param oItem 
   * @returns 
   */
  trackByItem(iIndex: number, oItem: any) {
    return oItem.fileName
  }


  getSearchString(oEvent: any) {
    // If the Enter key is hit, execute the search
    if (oEvent.code === 'Enter') {
      this.executeSearch()
    } else {
      // Set the search string
      this.m_sSearchString = oEvent.target.value
    }
  }

  executeSearch() {
    this.m_bSearchExecuted = true;
    this.filterProducts();
  }

  clearSearch() {
    this.m_bSearchExecuted = false;
    this.m_sSearchString = "";
    this.filterProducts();
  }

  productSort() {
    this.m_iSortClick += 1;

    if (this.m_iSortClick === 1) {
      // Sort Alphabetically
      this.sortAlpha();
    } else if (this.m_iSortClick === 2) {
      //Sort Reverse Alphabetically
      this.m_aoFilteredProducts.reverse();
    } else {
      //Give default sorting and reset counter
      this.m_oProductService.getProductListByWorkspace(this.m_oActiveWorkspace.workspaceId).subscribe({
        next: oResponse => {
          this.m_aoFilteredProducts = oResponse;
        }
      })
      this.m_iSortClick = 0;

    }
  }
  /**
   * Sort products alphabetically
   */
  sortAlpha() {
    this.m_aoFilteredProducts.sort(function (oProductA, oProductB) {
      return oProductA.name.localeCompare(oProductB.name);
    })
  }

  /**
   * Managee the selected products array
   * @param oEvent 
   */
  getProductSelection(oEvent): void {
    //If the product is checked (to be added to the array)
    if (oEvent.checked === true) {
      if (this.m_asSelectedProducts.length === 0) {
        this.m_asSelectedProducts.push(oEvent.product);
      } else if (!this.m_asSelectedProducts.includes(oEvent.product)) {
        this.m_asSelectedProducts.push(oEvent.product)
      }
    } else {
      //If the product should be removed from the array
      if (this.m_asSelectedProducts.includes(oEvent.product)) {
        let iIndex = this.m_asSelectedProducts.indexOf(oEvent.product);
        this.m_asSelectedProducts.splice(iIndex, 1);
      }
    }
  }
}