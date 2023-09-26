import { Injectable } from '@angular/core';
import { OpenSearchService } from './api/open-search.service';
import { of } from 'rxjs';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

export interface Provider {
  code: string,
  description: string,
  link: string
}

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  m_aoListOfProviders: Array<any> = [];
  m_aiProductsPerPage: Array<number> = [10, 15, 20, 25, 50];
  m_oFunction: any = null;

  constructor(
    private m_oOpenSearchService: OpenSearchService) {
    this.m_oOpenSearchService.getListOfProvider().subscribe({
      next: oResponse => {
        this.m_aoListOfProviders[0] = {
          "name": "AUTO",
          "totalOfProducts": 0,
          "totalPages": 1,
          "currentPage": 1,
          "productsPerPageSelected": 10,
          "selected": true,
          "isLoaded": false,
          "description": "WASDI Automatic Data Provider",
          "link": "https://www.wasdi.net"
        };

        let iLengthData = oResponse.length;
        for (var iIndexProvider = 0; iIndexProvider < iLengthData; iIndexProvider++) {
          this.m_aoListOfProviders[iIndexProvider + 1] = {
            "name": oResponse[iIndexProvider].code,
            "totalOfProducts": 0,
            "totalPages": 1,
            "currentPage": 1,
            "productsPerPageSelected": 10,
            "selected": false,
            "isLoaded": false,
            "description": oResponse[iIndexProvider].description,
            "link": oResponse[iIndexProvider].link
          };
        }
        return this.m_aoListOfProviders
      },
      error: oError => {
        console.log("Error getting providers");
      }
    })
  }

  setDefaultPaginationValuesForProvider() {

  }

  getProviders() {
    return this.m_aoListOfProviders;
  }

  getProvidersPerPageOptions() {
    return this.m_aiProductsPerPage;
  }

  setFunction(oFunction) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oFunction) === true) {
      return false;
    } else {
      this.m_oFunction = oFunction;
      return true;
    }
  }

  /**
   * Returns callback function
   * @returns {function}
   */
  getFunction() {
    return this.m_oFunction;
  }

  /**
   * Get index of selected provider
   * @param sProviderName 
   * @returns {number}
   */
  getProviderIndex(sProviderName: string) {
    let iResult: number = -1;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProviderName) === true)
      return iResult;
    let iNumberOfProviders = this.m_aoListOfProviders.length;

    for (let iIndexProvider = 0; iIndexProvider < iNumberOfProviders; iIndexProvider++) {
      if (this.m_aoListOfProviders[iIndexProvider].name === sProviderName) {
        iResult = iIndexProvider;
        break;
      }
    }

    return iResult;
  };

  /**
   * Get the object of the selected provider
   * @param sProviderName 
   * @returns 
   */
  getProviderObject(sProviderName) {
    var iIndexProviderFind = this.getProviderIndex(sProviderName);

    if (iIndexProviderFind === -1)
      return null;

    return this.m_aoListOfProviders[iIndexProviderFind];

  }

  countPages(sProviderName: string) {

    let oProvider = this.getProviderObject(sProviderName);

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return -1;
    }

    if (oProvider.productsPerPageSelected != 0) {
      if ((oProvider.totalOfProducts % oProvider.productsPerPageSelected) == 0) {
        oProvider.totalPages = Math.floor(oProvider.totalOfProducts / oProvider.productsPerPageSelected);
      }
      else {
        oProvider.totalPages = Math.floor(oProvider.totalOfProducts / oProvider.productsPerPageSelected) + 1;
      }
    }
    return oProvider.totalPages;
  };

  calcOffset(sProviderName: string) {
    let oProvider = this.getProviderObject(sProviderName);

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return -1;
    }

    return (oProvider.currentPage - 1) * oProvider.productsPerPageSelected;
  };

  changePage(iNewPage: any, sProviderName: string, oController) {
    iNewPage = parseInt(iNewPage);

    let oFunction = this.getFunction();
    let oProvider = this.getProviderObject(sProviderName);
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(oFunction) === true))
      return false;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(iNewPage) && isNaN(iNewPage) == false && FadeoutUtils.utilsIsInteger(iNewPage) && iNewPage >= 0 && iNewPage <= oProvider.totalPages) {
      oProvider.currentPage = iNewPage;
      oFunction(oProvider, oController);
    }
    else {
      return false;
    }
    return true;
  }

  plusOnePage(sProviderName, oController) {
    let oProvider = this.getProviderObject(sProviderName);
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true)) {
      return false;
    }

    let iNewPage = parseInt(oProvider.currentPage);

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(iNewPage) && isNaN(iNewPage) == false && FadeoutUtils.utilsIsInteger(iNewPage) && iNewPage >= 0 && iNewPage <= oProvider.totalPages) {
      oProvider.currentPage = iNewPage;
      this.changePage(oProvider.currentPage + 1, sProviderName, oController);
    }

    return true;
  };

  minusOnePage(sProviderName: string, oController) {
    let oProvider = this.getProviderObject(sProviderName);

    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true))
      return false;

    let iNewPage = parseInt(oProvider.currentPage);

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(iNewPage) && isNaN(iNewPage) == false && FadeoutUtils.utilsIsInteger(iNewPage) && iNewPage > 1 && iNewPage <= oProvider.totalPages) {
      oProvider.currentPage = iNewPage;
      this.changePage(oProvider.currentPage - 1, sProviderName, oController);
    }

    return true;
  };

  lastPage(sProviderName: string, oController) {

    let oProvider = this.getProviderObject(sProviderName);

    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true)) {
      return false;
    }

    this.changePage(oProvider.totalPages, sProviderName, oController);
    return true;

  };

  firstPage(sProviderName: string, oController: any) {
    this.changePage(1, sProviderName, oController);
  };

  getNumberOfProductsByProvider(sProviderName) {
    console.log(sProviderName)
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sProviderName.name) === true)
      return -1;
    let aoProviders = this.getProviders();
    console.log(this.getProviders)
    let iNumberOfProviders = aoProviders.length;

    for (let iIndexProvider = 0; iIndexProvider < iNumberOfProviders; iIndexProvider++) {
      if (aoProviders[iIndexProvider].name === sProviderName.name)
        return aoProviders[iIndexProvider].totalOfProducts;
    }

    return -1;
  };

  changeNumberOfProductsPerPage = function (sProviderName, oController) {
    let oFunction = this.getFunction();
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(sProviderName) === false) && (FadeoutUtils.utilsIsObjectNullOrUndefined(oController) === false) && (FadeoutUtils.utilsIsObjectNullOrUndefined(oFunction) === false)) {
      //countPages
      let oProvider = this.getProviderObject(sProviderName);
      oFunction(oProvider, oController);
      return true;
    }
    return false;
  };
}
