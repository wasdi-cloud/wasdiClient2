import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//Service Imports:
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ImageService } from 'src/app/services/api/image.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { TranslateService } from '@ngx-translate/core';

//Angular Material Imports:
import { MatDialog } from "@angular/material/dialog"
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

interface AppFilter {
  categories: [];
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
  styleUrls: ['./marketplace.component.css']
})
export class MarketplaceComponent implements OnInit {
  publisher: string;
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

  category = new FormControl('');
  m_asCategoryOptions: any = [];
  m_aoPublishers: any = [];

  m_bLoadMoreEnabled: boolean = true;
  m_bWaiting: boolean = true;

  publisherFilter!: string;
  m_sNameFilter!: string;

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private dialog: MatDialog,
    private m_oImageService: ImageService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getApplications();
    this.getCategories();
    this.getPublishers();
  }


  /**
   * Get Marketplace Categories
   */
  getCategories() {
    let sCategoriesError;
    this.m_oTranslate.get('MSG_WAPPS_CATEGORY_ERROR').subscribe(sResponse => {
      sCategoriesError = sResponse;
    })
    this.m_oProcessorMediaService.getCategories().subscribe(
      {
        next: oResponse => {
          if (oResponse.length === 0) {
            this.m_oAlertDialog.openDialog(4000, sCategoriesError);
          }
          this.m_asCategoryOptions = oResponse;
        },
        error: oError => {
          this.m_oAlertDialog.openDialog(4000, sCategoriesError);
        }
      })
  }

  /**
   * Get list of Publishers from the server
   */
  getPublishers() {
    let sErrorMsg: string;
    this.m_oTranslate.get("MSG_WAPPS_PUBLISHERS_ERROR").subscribe(sResponse => {
      sErrorMsg = sResponse;
    })
    this.m_oProcessorMediaService.getPublishersFilterList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoPublishers = oResponse;
        } else {
          this.m_oAlertDialog.openDialog(4000, sErrorMsg);
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sErrorMsg);
      }
    });
  }

  /**
   * 
   * @returns 
   */
  searchApps() {
    return this.m_aoApplications.filter(oApplication => oApplication.friendlyName.includes(this.m_sNameFilter))
  }

  /**
   * Retrieve the applications list from the server;
   */
  getApplications() {
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
          this.m_oAlertDialog.openDialog(4000, sErrorMsg);
        }
        this.m_bWaiting = false;
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sErrorMsg);
        this.m_bWaiting = false;
      }
    })
  }

  /**
   * Initialize applications with default logos
   * @param aoProcessorList 
   * @returns {*}
   */
  setDefaultImagesAndVotes(aoProcessorList: any) {
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
   * Refresh the application list
   */
  refreshAppList() {
    let sMessage: string;
    this.m_oTranslate.get("MSG_WAPPS_ERROR").subscribe(sResponse => {
      sMessage = sResponse;
    });

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
          this.m_oAlertDialog.openDialog(4000, sMessage);
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sMessage);
      }
    });
  }

  /**
   * Handle Load More Button
   */
  loadMore() {
    this.m_oAppFilter.page = this.m_oAppFilter.page + 1;
    this.refreshAppList();
  }

  developerChanged(event) {
    if (this.m_oAppFilter.publishers.length !== 0 || event.target.value === 'all') {
      this.m_oAppFilter.publishers.splice(0, this.m_oAppFilter.publishers.length)
      console.log(this.m_oAppFilter)
    }
    if (event.target.value === 'all') {
      this.getApplications()
    } else {
      this.m_oAppFilter.publishers.push(event.target.value);
      this.getApplications()
    }

  }
  //Success rate will need to be added
  successChanged() {

  }

  //most used will need to be added
  usedChanged() {

  }

  maxPriceChanged(event) {
    this.m_oAppFilter.maxPrice = event.target.value;

    this.getApplications()
  }

  ratingChanged(event) {
    this.m_oAppFilter.score = event.target.value;
    this.getApplications()
  }
}