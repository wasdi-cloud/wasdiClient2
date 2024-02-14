import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faArrowLeft, faInfoCircle, faPlus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { WorkspacesListDialogComponent } from '../workspaces-list-dialog/workspaces-list-dialog.component';
import { ProductInfoComponent } from '../product-info/product-info.component';
import { MapService } from 'src/app/services/map.service';
import { PagesService } from 'src/app/services/pages.service';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.css']
})
export class ProductsTableComponent implements OnInit {
  @Input() m_bIsVisibleListOfLayers: boolean = false;
  @Input() m_bIsPaginatedList: boolean;
  @Input() m_aoProducts: Observable<any>;
  @Input() m_aoSelectedProviders: Observable<any>;
  @Output() m_oActiveProviderChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oSelectedProducts: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oNavigateBackOutput: EventEmitter<any> = new EventEmitter<boolean>();

  m_aoProductsList: any = [];
  //font awesome icons: 
  faBack = faArrowLeft;
  faPlus = faPlus;
  faSearch = faSearchPlus;
  faInfoCircle = faInfoCircle;

  m_aoProvidersList: Array<any> = [];
  m_oActiveProvider: any = null;

  m_bProductListEmpty = false;

  m_aiProductsPerPageOptions = []

  m_aoSelectedProducts: Array<any> = [];

  constructor(
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oPageService: PagesService
  ) { }

  ngOnInit(): void {
    //Set the selected providers array and set the first selected Provider as the active provider
    this.m_aoSelectedProviders.subscribe(oResponse => {
      console.log(oResponse)
      if (oResponse.length > 0) {
        oResponse.forEach(oProvider => {
          if (!this.m_aoProvidersList.includes(oProvider)) {
            if (oProvider.name === 'AUTO') {
              this.m_aoProvidersList.unshift(oProvider)
            } else {
              this.m_aoProvidersList.push(oProvider)
            }
          }
        });
        this.setActiveProvider(this.m_aoProvidersList[0])
      }
    });
    //Set the products array value
    this.m_aoProducts.subscribe(oResponse => {
      console.log(oResponse)
      if (oResponse.length > 0) {
        this.m_aoProductsList = oResponse;
        if (this.m_oActiveProvider.name) {
          this.updateLayerListForActiveTab(this.m_oActiveProvider.name)
        }
      }
    });

    //Get Products Per Page Options:
    this.m_aiProductsPerPageOptions = this.getProductsPerPageOptions();
  }

  /**
   * Sets the Active Provider and emits the Provider to the Parent for Switching Layers List
   * @param oProvider 
   * @returns 
   */
  setActiveProvider(oProvider) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider)) {
      console.log("Error in Switching Provider");
      return false;
    }

    this.m_oActiveProvider = oProvider;
    this.getNumberOfProductsByProdvider(oProvider);
    this.updateLayerListForActiveTab(oProvider)
    this.m_oActiveProviderChange.emit(this.m_oActiveProvider);
    console.log(this.m_oActiveProvider)
    return true;
  }

  /**
   * Returns boolean confirming the status of the product list
   * @returns boolean
   */
  isProductListEmpty() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProductsList)) {
      return true
    }
    if (this.m_aoProductsList.length == 0) {
      return true
    }
    return false;
  }

  /**
   * Returns boolean confirming the status of the provider list
   * @param sProviderName
   * @returns boolean
   */
  isProviderLayerListEmpty(sProviderName: string) {
    if (!sProviderName) {
      console.log("no provider")
      return false;
    }
    var iNumberOfProduct = this.m_aoProductsList.length;
    var bIsEmpty = true;

    for (let iIndexProduct = 0; iIndexProduct < iNumberOfProduct; iIndexProduct++) {
      if (this.m_aoProductsList[iIndexProduct].provider === sProviderName) {
        bIsEmpty = false;
        return bIsEmpty;
      }
    }
    return bIsEmpty;
  }

  /********** Provider Information Management Methods **********/
  /**
   * On Switching Provider emit change to parent in order to change products on map
   * @param sProviderName
   */
  updateLayerListForActiveTab(sProvider: string) {

    let aaoAllBounds = [];

    this.deleteLayers();

    for (let iIndexData = 0; iIndexData < this.m_aoProductsList.length; iIndexData++) {
      if (this.m_aoProductsList[iIndexData].provider !== sProvider) continue;

      let oRectangle = this.m_oMapService.addRectangleByBoundsArrayOnMap(this.m_aoProductsList[iIndexData].bounds, null, iIndexData);
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle) === false) {
        this.m_aoProductsList[iIndexData].rectangle = oRectangle
      }
      aaoAllBounds.push(this.m_aoProductsList[iIndexData].bounds);
    }

    if (aaoAllBounds.length > 0 && aaoAllBounds[0]?.length) {
      this.m_oMapService.zoomOnBounds(aaoAllBounds);
    }
  }


  /********** Layer Information Management Methods **********/

  /**
   * Get the preview image for products
   * @param oLayer
   */
  getPreviewLayer(oLayer: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer) === true) {
      return null;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer.link) === true) {
      return null
    }

    let iLinkLength = oLayer.link.length;

    for (let iIndex = 0; iIndex < iLinkLength; iIndex++) {
      if (oLayer.link[iIndex].rel == "icon") {
        if ((!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer.link[iIndex].image)) && (!FadeoutUtils.utilsIsObjectNullOrUndefined(oLayer.link[iIndex].image.content))) {
          return oLayer.link[iIndex].image.content;
        }
      }
    }

    return null;
  }

  getNumberOfProductsByProdvider(sProviderName) {
    return this.m_oPageService.getNumberOfProductsByProvider(sProviderName)
  }

  deleteLayers() {
    if (this.isProductListEmpty() === true) {
      return false;
    }

    let iLengthProductsList = this.m_aoProductsList.length;
    let oMap = this.m_oMapService.getMap();
    for (let iIndexProductsList = 0; iIndexProductsList < iLengthProductsList; iIndexProductsList++) {
      let oRectangle = this.m_aoProductsList[iIndexProductsList].rectangle;
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle))
        oRectangle.removeFrom(oMap);
    }
    return true;
  }


  /********** Event Emitters **********/


  /********** Button Handler Functions **********/
  /**
   * 
   */
  navigateBackToFilters() {
    this.m_oNavigateBackOutput.emit(false);
  }


  /**
   * Add checked product to selected products array
   */
  addProductSelectedProducts(oEvent, oInputProduct) {
    console.log(oEvent);
    


    // if (oEvent.currentTarget.checked === true) {
    //   //Add the Product to the Selected Products Array
    //   this.m_aoSelectedProducts.push(oInputProduct);
    // } else {
    //   //Remove Product from the Selected Products Array
    //   this.m_aoSelectedProducts = this.m_aoSelectedProducts.filter(oProduct => oProduct.id != oInputProduct.id);
    // }
    this.m_oSelectedProducts.emit(this.m_aoSelectedProducts);
  }

  /**
   * Open dialog to add single product to a workspace
   */
  sendSingleProductToWorkspace(oProduct) {
    let oDialog = this.m_oDialog.open(WorkspacesListDialogComponent, {
      height: "55vh",
      width: '60vw',
      data: {
        product: oProduct
      }
    })
  }

  /**
   * Move map to selected Product
   */
  zoomToProduct(oRectangle) {
    let oBounds = oRectangle.getBounds();
    let oNorthEast = oBounds.getNorthEast();
    let oSouthWest = oBounds.getSouthWest();

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oNorthEast) || FadeoutUtils.utilsIsObjectNullOrUndefined(oSouthWest)) {
      console.log("Error in zoom on bounds");
    }
    else {
      let aaBounds = [[oNorthEast.lat, oNorthEast.lng], [oSouthWest.lat, oSouthWest.lng]];
      if (this.m_oMapService.zoomOnBounds(aaBounds) == false) {
        console.log("Error in zoom on bounds");
      }
    }
  }

  /**
   * Open the information dialog for product
   */
  openProductInfoDialog(oProduct) {
    let oDialog = this.m_oDialog.open(ProductInfoComponent, {
      height: "60vh",
      width: '60vw',
      data: {
        product: oProduct
      }
    })
  }

  /**
   * Handle mouseover on product card
   * @param oRectangle
   */
  changeRectangleStyleMouseOver(oRectangle) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle)) {
      console.log("Error: rectangle is undefined ");
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle._rawPxBounds)) {
      return false;
    }
    oRectangle.setStyle({ weight: 3, fillOpacity: 0.7 });
    return true;
  }

  /**
   * handle mouseleave on product card
   * @param oRectangle
   */
  changeRectangleStyleMouseLeave(oRectangle) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle)) {
      console.log("Error: rectangle is undefined ");
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oRectangle._rawPxBounds)) {
      return false;
    }
    oRectangle.setStyle({ weight: 1, fillOpacity: 0.2 });
    return true;
  }

  /********** Pagination Handler Functions **********/

  changeNumberOfProductsPerPage(event) {
    this.m_oPageService.getProviderObject(this.m_oActiveProvider.name).productsPerPageSelected = event.value;
    this.m_oPageService.changeNumberOfProductsPerPage(this.m_oActiveProvider.name);
  }

  getProductsPerPageOptions() {
    return this.m_oPageService.getProvidersPerPageOptions();
  }

  plusOnePage() {
    this.m_oPageService.plusOnePage(this.m_oActiveProvider.name);
  }

  minusOnePage() {
    this.m_oPageService.minusOnePage(this.m_oActiveProvider.name);
  }

  getMaxPage() {
    return this.m_oPageService.getProviderObject(this.m_oActiveProvider.name).totalPages;
  }

  getCurrentPage() {
    return this.m_oPageService.getProviderObject(this.m_oActiveProvider.name).currentPage;
  }
}
