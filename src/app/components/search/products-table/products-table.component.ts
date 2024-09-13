import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  m_aoProvidersList: Array<any> = [];
  m_oActiveProvider: any = null;

  m_bProductListEmpty = false;

  m_aiProductsPerPageOptions = []

  m_aoSelectedProducts: Array<any> = [];

  m_bAllSelected: boolean = false;

  constructor(
    public m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oPageService: PagesService
  ) { }

  ngOnInit(): void {
    //Set the selected providers array and set the first selected Provider as the active provider
    this.m_aoSelectedProviders.subscribe(oResponse => {
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
      if (oResponse.length > 0) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveProvider) === false) {
          this.m_aoProductsList = [];
          oResponse.forEach(oProduct => {
            if (oProduct.provider === this.m_oActiveProvider.name) {
              this.m_aoProductsList.push(oProduct);
            }
            if (this.m_oActiveProvider.name) {
              this.updateLayerListForActiveTab(this.m_oActiveProvider.name)
            }
          })
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

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveProvider) && (oProvider.name === this.m_oActiveProvider.name)) {
      return true;
    } else {
      this.m_oActiveProvider = oProvider;
      this.m_oActiveProvider.isOpen = true;
      this.getNumberOfProductsByProvider(oProvider);
      this.updateLayerListForActiveTab(oProvider)
      this.m_oActiveProviderChange.emit(this.m_oActiveProvider);
      return true;
    }

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
      return false;
    }
    let iNumberOfProduct = this.m_aoProductsList.length;
    let bIsEmpty = true;

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
      let oProduct = this.m_aoProductsList[iIndexData]
      let oRectangle = this.m_oMapService.addRectangleByBoundsArrayOnMap(oProduct, null, iIndexData);
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

  getNumberOfProductsByProvider(sProviderName) {
    return this.m_oPageService.getNumberOfProductsByProvider(sProviderName)
  }

  deleteLayers(): boolean {
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
   * Navigate the user back to the filters list
   */
  navigateBackToFilters(): void {
    this.m_aoProvidersList = [];
    this.m_oNavigateBackOutput.emit(false);
  }

  /**
   * Add checked product to selected products array
   */
  addProductSelectedProducts(oInputProduct): void {
    oInputProduct.selected = !oInputProduct.selected

    if (oInputProduct.selected === true) {
      //Add the Product to the Selected Products Array
      this.m_aoSelectedProducts.push(oInputProduct);
    } else {
      //Remove Product from the Selected Products Array
      this.m_aoSelectedProducts = this.m_aoSelectedProducts.filter(oProduct => oProduct.id != oInputProduct.id);
    }
    this.m_oSelectedProducts.emit(this.m_aoSelectedProducts);
  }

  // selectAllProducts() {
  //   this.m_bAllSelected = !this.m_bAllSelected;
  //   for (let oProduct of this.m_aoProductsList) {
  //     this.m_bAllSelected ? oProduct.selected = true : oProduct.select = false;
  //   }
  // }
  /**
   * Open dialog to add single product to a workspace
   */
  sendSingleProductToWorkspace(oProduct): void {
    let oDialog = this.m_oDialog.open(WorkspacesListDialogComponent, {
      height: "70vh",
      width: '50vw',
      data: {
        product: oProduct
      }
    })
  }

  /**
   * Move map to selected Product
   */
  zoomToProduct(oRectangle): void {
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
   * @returns void
   */
  openProductInfoDialog(oProduct): void {
    let oDialog = this.m_oDialog.open(ProductInfoComponent, {
      data: {
        product: oProduct
      },
      height: '70vh',
      minWidth: '50vw'
    });
  }

  /**
   * Handle mouseover on product card
   * @param oRectangle
   * @returns boolean
   */
  changeRectangleStyleMouseOver(oRectangle): boolean {
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

  changeCardStyleMouseEnter(oEvent) {

  }

  /********** OPEN DIALOG HANDLERS **********/

  /**
   * Open the add to Workspace Dialog
   * @returns boolean
   */
  openAddToWorkspaceDialog(): boolean {
    let aoListOfSelectedProducts = this.m_aoSelectedProducts;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoListOfSelectedProducts) === true) {
      return false;
    }

    this.m_oDialog.open(WorkspacesListDialogComponent, {
      height: "70vh",
      width: '50vw',
      data: {
        products: aoListOfSelectedProducts
      }
    })
    return true;
  }

  /**
   * Toggle the expand more/less chevron in the list item component
   * @param oEvent 
   * @param oProvider 
   */
  toggleActiveProviderOpen(oEvent, oProvider: any): void {
    if (oProvider.name === this.m_oActiveProvider.name) {
      this.m_oActiveProvider.isOpen = !this.m_oActiveProvider.isOpen;
    }
  }

  /********** Pagination Handler Functions **********/

  /**
   * Handle change in number of products per page from paginator
   * @param event 
   */
  changeNumberOfProductsPerPage(event): void {
    this.m_oPageService.getProviderObject(this.m_oActiveProvider.name).productsPerPageSelected = event;
    this.m_oPageService.changeNumberOfProductsPerPage(this.m_oActiveProvider.name);
  }

  /**
   * Read pagination object + change page from paginator
   * @param oEvent 
   * @param sProviderName 
   */
  handlePagination(oEvent, sProviderName: string) {
    this.m_oPageService.changePage(oEvent.pageIndex, sProviderName)
  }

  /**
   * Get the page number options for paginator
   * @returns number[]
   */
  getProductsPerPageOptions(): number[] {
    return this.m_oPageService.getProvidersPerPageOptions();
  }
}
