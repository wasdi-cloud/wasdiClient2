import { Component, Input, OnInit } from '@angular/core';
import { faInfoCircle, faPlus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

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

  constructor() { }

  ngOnInit(): void {
    this.m_aoProducts.subscribe(oResponse => {
      if (oResponse.length > 0) {
        this.m_aoProductsList = oResponse;
      }
    });

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
      }
    })
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

}
