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

        var iLengthData = oResponse.length;
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
      },
      error: oError => {
        console.log("Error getting providers");
      }
    })
  }

  setDefaultPaginationValuesForProvider() {

  }

  getProviders() {
    return of(this.m_aoListOfProviders);
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
   * @param sProvider 
   * @returns {number}
   */
  getProviderIndex(sProvider: string) {
    let iResult: number = -1;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProvider) === true)
      return iResult;
    let iNumberOfProviders = this.m_aoListOfProviders.length;

    for (let iIndexProvider = 0; iIndexProvider < iNumberOfProviders; iIndexProvider++) {
      if (this.m_aoListOfProviders[iIndexProvider].name === sProvider) {
        iResult = iIndexProvider;
        break;
      }
    }

    return iResult;
  };

  /**
   * Get the object of the selected provider
   * @param sProvider 
   * @returns 
   */
  getProviderObject(sProvider) {
    var iIndexProviderFind = this.getProviderIndex(sProvider);

    if (iIndexProviderFind === -1)
      return null;

    return this.m_aoListOfProviders[iIndexProviderFind];

  }

  countPages(sProvider: string) {

    let oProvider = this.getProviderObject(sProvider);

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

  calcOffset(sProvider: string) {
    let oProvider = this.getProviderObject(sProvider);

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProvider) === true) {
      return -1;
    }

    return (oProvider.currentPage - 1) * oProvider.productsPerPageSelected;
  };
}
