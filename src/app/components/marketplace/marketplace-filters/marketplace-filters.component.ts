import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { TranslateService } from '@ngx-translate/core';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


@Component({
  selector: 'app-marketplace-filters',
  templateUrl: './marketplace-filters.component.html',
  styleUrls: ['./marketplace-filters.component.css']
})
export class MarketplaceFiltersComponent implements OnInit {
  m_asCategoryOptions: Array<any> = [];
  m_aoSelectedCategories: Array<any> = [];
  m_aoPublishers: any = [];
  m_sDeveloperSearch: string = "";
  m_aoSelectedPublishers: any = [];

  m_aiRatingsFilter: Array<number> = [4, 3, 2, 1];

  m_oAppFilter = {
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

  /** */
  @Output() m_oAppFilterOutput = new EventEmitter();

  constructor(private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,) {

  }

  ngOnInit(): void {
    this.getCategories();
    this.getPublishers();
  }

  getCategories(): void {
    let sCategoriesError;
    this.m_oTranslate.get('MSG_WAPPS_CATEGORY_ERROR').subscribe(sResponse => {
      sCategoriesError = sResponse;
    })
    this.m_oProcessorMediaService.getCategories().subscribe(
      {
        next: oResponse => {
          if (oResponse.length === 0) {
            this.m_oNotificationDisplayService.openAlertDialog(sCategoriesError);
          }
          this.m_asCategoryOptions = oResponse;
          console.log(this.m_asCategoryOptions)
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sCategoriesError);
        }
      })
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
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }

  developerChanged(oEvent) {
    let iDeveloperIndex = this.m_aoSelectedPublishers.indexOf(oEvent.publisher)
    if (iDeveloperIndex === -1) {
      this.m_aoSelectedPublishers.push(oEvent.publisher);
    } else {
      this.m_aoSelectedPublishers.splice(iDeveloperIndex, 1);
    }
    //Add Selected Developers to the App Filter publishers and then get applicatinons
    this.m_oAppFilter.publishers = this.m_aoSelectedPublishers;
    this.m_oAppFilter.page = 0;
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }

  /**
 * Get list of Publishers from the server
 * @returns {void}
 */
  getPublishers(): void {
    let sErrorMsg: string;
    this.m_oTranslate.get("MSG_WAPPS_PUBLISHERS_ERROR").subscribe(sResponse => {
      sErrorMsg = sResponse;
    })
    this.m_oProcessorMediaService.getPublishersFilterList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoPublishers = oResponse;
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
      }
    });
  }

  ratingChanged(oEvent) {
    console.log(oEvent.target.value)
    this.m_oAppFilter.score = oEvent.target.value;
    this.m_oAppFilter.page = 0;
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }
}
