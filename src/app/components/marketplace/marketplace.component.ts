import { Component, OnInit } from '@angular/core';

//Service Imports:
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ImageService } from 'src/app/services/api/image.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { TranslateService } from '@ngx-translate/core';

//Angular Material Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

interface AppFilter {
  categories: any[];
  publishers: string[],
  name: string,
  score: number,
  minPrice: number,
  maxPrice: number,
  itemsPerPage: number,
  page: number,
  orderBy: string,
  orderDirection: number
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css'],
  host: { 'class': 'flex-fill' }
})
export class MarketplaceComponent implements OnInit {
  m_sPublisher: string;
  m_oAppFilter: AppFilter = {
    categories: [],
    publishers: [],
    name: "",
    score: 0,
    minPrice: -1,
    maxPrice: 1000,
    itemsPerPage: 12,
    page: 0,
    orderBy: "name",
    orderDirection: 1
  }

  m_aoApplications: any = [];

  m_asCategoryOptions: any = [];
  m_aoPublishers: any = [];

  m_bLoadMoreEnabled: boolean = true;
  m_bWaiting: boolean = true;

  m_sNameFilter!: string;
  m_sNameFilterSubscription: any;

  m_aoSelectedPublishers: Array<any> = [];
  m_aoSelectedCategories: Array<any> = [];
  m_iSelectedStarRating: number = 0;

  m_sDeveloperSearch: string = "";
  constructor(
    private m_oImageService: ImageService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getApplications();
  }

  /**
   * Retrieve the applications list from the server
   * @returns {void}
   */
  getApplications(): void {
    let sErrorMsg: string;
    this.m_oTranslate.get("MSG_WAPPS_ERROR").subscribe(sResponse => {
      sErrorMsg = sResponse;
    });

    this.m_oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe({
      next: oResponse => {
        if (oResponse) {
          if (this.m_oAppFilter.page === 0) {
            this.m_aoApplications = this.setDefaultImagesAndVotes(oResponse);
          } else {
            if (oResponse.length > 0) {
              this.m_aoApplications = this.m_aoApplications.concat(this.setDefaultImagesAndVotes(oResponse));
            }
          }

          //If there is no data, disable the 'Load More' Button
          if (oResponse.length > 0) {
            this.m_bLoadMoreEnabled = true;
          } else {
            this.m_bLoadMoreEnabled = false;
          }
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'alert');
        }
        this.m_bWaiting = false;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'alert');
        this.m_bWaiting = false;
      }
    })
  }

  /**
   * Initialize applications with default logos and return array of processors with new image links
   * @param aoProcessorList 
   * @returns {Array<any>}
   */
  setDefaultImagesAndVotes(aoProcessorList: any): Array<any> {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProcessorList) === true) {
      return aoProcessorList;
    }

    let sDefaultImage = "assets/wasdi/miniLogoWasdi.png";
    let iNumberOfProcesses: number = aoProcessorList.length;

    for (let iIndexProcessor = 0; iIndexProcessor < iNumberOfProcesses; iIndexProcessor++) {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProcessorList[iIndexProcessor].imgLink)) {
        aoProcessorList[iIndexProcessor].imgLink = sDefaultImage;
      }

      this.m_oImageService.updateProcessorLogoImageUrl(aoProcessorList[iIndexProcessor]);

      if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProcessorList[iIndexProcessor].votes)) {
        if (aoProcessorList[iIndexProcessor].score > 0) {
          aoProcessorList[iIndexProcessor].votes = 1;
        }
        else {
          aoProcessorList[iIndexProcessor].votes = 0;
        }
      }
    }
    return aoProcessorList;
  }

  /**
   * Refresh the application list when filters or search text is updated
   * @returns {void}
   */
  refreshAppList(): void {
    let sMessage: string;
    this.m_oTranslate.get("MSG_WAPPS_ERROR").subscribe(sResponse => {
      sMessage = sResponse;
    });

    if (this.m_sNameFilter == undefined) this.m_sNameFilter = "";
    if (this.m_oAppFilter.name == undefined) this.m_oAppFilter.name = "";

    if (this.m_sNameFilter !== this.m_oAppFilter.name) {
      this.m_oAppFilter.page = 0;
      this.m_oAppFilter.name = this.m_sNameFilter;
    }

    this.m_bWaiting = false;

    this.m_oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (this.m_oAppFilter.page == 0) {
            this.m_aoApplications = this.setDefaultImagesAndVotes(oResponse);
          } else {
            if (oResponse.length > 0) {
              this.m_aoApplications = this.m_aoApplications.concat(this.setDefaultImagesAndVotes(oResponse));
            }
          }
          //If there is no data, do not enable the Load More button
          if (oResponse.length > 0) {
            this.m_bLoadMoreEnabled = true;
          } else {
            this.m_bLoadMoreEnabled = false;
          }
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert');
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert');
      }
    });
  }

  /**
   * Handle Load More Button
   * @returns {void}
   */
  loadMore(): void {
    this.m_oAppFilter.page = this.m_oAppFilter.page + 1;
    this.refreshAppList();
  }


  /**
   * Clear the Search Input Field
   * @param oEvent 
   * @returns {void}
   */
  clearSearchInput(oEvent): void {
    this.m_sNameFilter = "";
    this.refreshAppList();
  }

  /**
   * Handle changes to developer selection dropdown
   * @param oEvent 
   * @returns {void}
   */
  developerChanged(oEvent): void {
    let iDeveloperIndex = this.m_aoSelectedPublishers.indexOf(oEvent.publisher)
    if (iDeveloperIndex === -1) {
      this.m_aoSelectedPublishers.push(oEvent.publisher);
    } else {
      this.m_aoSelectedPublishers.splice(iDeveloperIndex, 1);
    }
    //Add Selected Developers to the App Filter publishers and then get applications
    this.m_oAppFilter.page = 0;
    this.getApplications();

  }

  categoriesChanged(oEvent): void {
    let iCategoryIndex = this.m_aoSelectedCategories.indexOf(oEvent.id)

    if (iCategoryIndex === -1) {
      this.m_aoSelectedCategories.push(oEvent.id);
    } else {
      this.m_aoSelectedCategories.splice(iCategoryIndex, 1);
    }
    //Add Selected Categories to the App Filter Categories and then get applications
    this.m_oAppFilter.categories = this.m_aoSelectedCategories;
    this.m_oAppFilter.page = 0;
    this.getApplications();
  }

  /**
   * Handler for Sorting Apps: 
   */

  //TODO: Sort apps based on Success Rate
  successChanged() {

  }

  //TODO: Sort apps based on usage
  usedChanged() {

  }

  maxPriceChanged(oEvent) {
    this.m_oAppFilter.maxPrice = oEvent.target.value;
    this.m_oAppFilter.page = 0;
    this.getApplications();

  }

  ratingChanged(oEvent) {
    this.m_oAppFilter.score = oEvent;
    this.m_oAppFilter.page = 0;
    this.getApplications();

  }

  getAppFilter(oEvent) {
    this.m_oAppFilter = oEvent;
    this.getApplications();
  }

  setSorting(sColumn: string) {
    if (this.m_oAppFilter.orderBy === sColumn) {
      if (this.m_oAppFilter.orderDirection === 1) this.m_oAppFilter.orderDirection = -1;
      else if (this.m_oAppFilter.orderDirection === -1) this.m_oAppFilter.orderDirection = 1;
      else this.m_oAppFilter.orderDirection = 1;
    }

    this.m_oAppFilter.orderBy = sColumn;
    this.m_oAppFilter.page = 0;


    this.refreshAppList();
  }
}