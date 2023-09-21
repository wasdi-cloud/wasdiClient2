import { Component, Input, OnInit } from '@angular/core';
import { faInfoCircle, faPlus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { WorkspacesListDialogComponent } from '../workspaces-list-dialog/workspaces-list-dialog.component';
import { ProductInfoComponent } from '../product-info/product-info.component';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.css']
})
export class ProductsTableComponent implements OnInit {
  @Input() m_bIsVisibleListOfLayers: boolean;
  @Input() m_bIsPaginatedList: boolean;
  @Input() m_aoProducts: Observable<any>;
  @Input() m_aoSelectedProviders: Observable<any>;
  m_aoProductsList: any;
  //font awesome icons: 
  faPlus = faPlus;
  faSearch = faSearchPlus;
  faInfoCircle = faInfoCircle;

  m_aoProvidersList: Array<any> = [];
  m_iActiveProvider: number;
  m_oActiveProvider: any = null;

  constructor(
    private m_oDialog: MatDialog
  ) { }

  ngOnInit(): void {
    //Set the products array value
    this.m_aoProducts.subscribe(oResponse => {
      if (oResponse.length > 0) {
        this.m_aoProductsList = oResponse;
      }
    });

    //Set the selected providers array and set the first selected Provider as the active provider
    this.m_aoSelectedProviders.subscribe(oResponse => {
      console.log(oResponse);
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
        this.m_oActiveProvider = this.m_aoProvidersList[0];
      }
    })
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
    return true;
  }

  /**
   * Returns boolean confirming the status of the product list
   * @returns boolean
   */
  isProductListEmpty(): boolean {
    return false;
  }

  /********** Provider Information Management Methods **********/

  /**
   * Get the number of Products from a given provider
   * @param sProviderName
   */
  getNumberOfProductsByProvider(sProviderName: string) {

  }

  /**
   * On Switching Provider emit change to parent in order to change products on map
   * @param sProviderName
   */
  updateLayerListForActiveTab(sProviderName: string) { }


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

  /********** Event Emitters **********/


  /********** Button Handler Functions **********/

  /**
   * Add checked product to selected products array
   */
  addProductSelectedProducts() {

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
  zoomToProduct() {

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
}
