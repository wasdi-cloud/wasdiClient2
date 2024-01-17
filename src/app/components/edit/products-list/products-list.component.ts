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
   * Event to notify that the list of products changed (ie deleted a product?)
   */
  @Output() m_oProductArrayOutput = new EventEmitter();
  /**
   * Search String filter
   */
  @Input() m_sSearchString: string;
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
   * Flag to know if the products are still loading or not
   */
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

  /**
   * Array of (potentially) filtered products to show
   */
  m_aoFilteredProducts: any[] = [];
  /**
   * Active Workspace, used mainly as argument to different API services
   */
  m_oActiveWorkspace: any;
  /**
   * List of the visible layers
   */
  m_aoVisibleBands: any[] = [];
  /**
   * List of selected Products
   */
  m_aoSelectedProducts: Array<any> = [];
  /**
   * Flag to know if the Workspace is in read only mode or not
   */
  m_bIsReadOnly: boolean = true;

  constructor(
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFileBufferService: FileBufferService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oNotificationsQueueService: NotificationsQueueService,
    private m_oProductService: ProductService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oTranslate: TranslateService,
    private m_oRouter: Router
  ) { }

  /**
   * Initializes the Component
   */
  ngOnInit(): void { 

  }


  ngOnChanges() {
    // If we have products try to filter
    if (this.m_aoWorkspaceProductsList != null) {
      if (this.m_aoWorkspaceProductsList.length>0) {
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

  filterProducts() {

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoWorkspaceProductsList)) {
      if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sSearchString)) {

        FadeoutUtils.verboseLog("ProductList.ngOnChanges: filtering products");

        let aoFiltered = [];

        this.m_aoWorkspaceProductsList.forEach(oProduct => {
          if (oProduct.fileName.indexOf(this.m_sSearchString) !== -1 || oProduct.name.indexOf(this.m_sSearchString) !== -1) {
            aoFiltered.push(oProduct)
          }
          else if (oProduct.productFriendlyName) {
            if (oProduct.productFriendlyName.indexOf(this.m_sSearchString) !== -1) {
              aoFiltered.push(oProduct)
            }
          }
        });

        this.m_aoFilteredProducts = aoFiltered;
      }
      else{
        this.m_aoFilteredProducts = this.m_aoWorkspaceProductsList;
      }
    }
    else {
      this.m_aoFilteredProducts = []
    }
  }

  /**
   * Adds or Removes a product to the selected List once the user clicks on the associated checkbox
   * @param oEvent 
   * @param oProduct 
   */
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

  /**
   * Handle the click on the select (de-select) all button
   * @param oEvent 
   */
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

  /**
   * Called from the Product List tree when the user wants to download many products at once.
   */
  downloadMultipleProducts() {

    this.m_aoSelectedProducts.forEach(oProduct => {
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
        this.m_oNotificationDisplayService.openAlertDialog("Problem in getting Product Download");
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
      width: '60vw'
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
   * Delete Product command: ask for confirmatio and, in case, calls the API to delete a product
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

    let sMessage = "Are you sure you wish to delete " + this.m_aoSelectedProducts.length + " products?";

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sMessage);

    bConfirmResult.subscribe(oDialogResult => {
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
                this.m_oNotificationDisplayService.openAlertDialog("Error deleting " + oProduct.fileName);
                return false;
              }
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Error deleting " + oProduct.fileName);
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
  setBandImage(oBand: any, iIndex: number) {

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
    let bAlreadyPublished = oBand.published;

    this.m_oFileBufferService.publishBand(sFileName, this.m_oActiveWorkspace.workspaceId, oBand.name).subscribe(oResponse => {
      if (!bAlreadyPublished) {
        let sNotificationMsg = "PUBLISHING BAND";
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");
      }

      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.messageResult != "KO" && FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.messageResult)) {
        //If the Band is already published: 
        if (oResponse.messageCode === "PUBLISHBAND") {
          this.receivedPublishBandMessage(oResponse, oBand);

        } 
        else {
          this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
        }
        oBand['productName'] = oResponse.payload.productName
        this.m_aoVisibleBands.push(oBand);

        this.m_aoVisibleBandsOutput.emit(this.m_aoVisibleBands);
        if (this.m_b2DMapMode === true) {

          this.m_oMapService.zoomBandImageOnGeoserverBoundingBox(oResponse.payload.geoserverBoundingBox);
        } else {
          this.m_oGlobeService.zoomBandImageOnGeoserverBoundingBox(oResponse.payload.geoserverBoundingBox);
        }
      } 
      else {
        let sNotificationMsg = this.m_oTranslate.instant("MSG_PUBLISH_BAND_ERROR");
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom");


      }
      //It is publishing; we will receieve a Rabbit Message
      if (oResponse.messageCode === "WAITFORRABBIT") {
        FadeoutUtils.verboseLog("ProductListComponent.OpenBandImage: WAITING FOR RABBIT");
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

    if (this.m_b2DMapMode === false) {
      //if we are in 3D put the layer on the globe
      this.m_oGlobeService.addLayerMap3DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
    } else {
      //if we are in 2D put it on the map
      this.m_oMapService.addLayerMap2DByServer(oActiveBand.layerId, oActiveBand.geoserverUrl);
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
    let oDialog = this.m_oDialog.open(ImportDialogComponent, {
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
}
