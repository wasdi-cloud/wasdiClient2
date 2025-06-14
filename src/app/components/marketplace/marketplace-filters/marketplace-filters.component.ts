import { Component, EventEmitter, OnInit, OnChanges, Output, Input, AfterContentChecked, SimpleChange } from '@angular/core';

import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { TranslateService } from '@ngx-translate/core';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConstantsService } from 'src/app/services/constants.service';
import { AuthService } from 'src/app/auth/service/auth.service';

@Component({
  selector: 'app-marketplace-filters',
  templateUrl: './marketplace-filters.component.html',
  styleUrls: ['./marketplace-filters.component.css'],
})
export class MarketplaceFiltersComponent implements OnInit {
  m_asCategoryOptions: Array<any> = [];
  m_aoSelectedCategories: Array<any> = [];
  m_aoPublishers: any = [];
  m_sDeveloperSearch: string = "";
  m_aoSelectedPublishers: any = [];

  m_aiRatingsFilter: Array<number> = [5, 4, 3, 2, 1];

  m_sSearchInput: string = '';

  m_oAppFilter = {
    categories: [],
    publishers: [],
    name: '',
    score: 0,
    minPrice: -1,
    maxPrice: -1,
    itemsPerPage: 12,
    page: 0,
    orderBy: 'name',
    orderDirection: 1,
  };

  @Input() m_asDefaultSelectedCategories: string[] = [];
  @Output() m_oAppFilterOutput = new EventEmitter();

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,) { }

  ngOnInit(): void {
    setTimeout(() => {
      if (
        this.m_oAuthService.getTokenObject().access_token &&
        this.m_oConstantsService.getUser().userId
      ) {
        this.getPublishers();
        this.getCategories();
      }
    }, 500);
  }

  ngOnChanges(oChanges: SimpleChange): void {
    if (
      oChanges['m_asDefaultSelectedCategories'] &&
      this.m_asCategoryOptions.length > 0 &&
      this.m_asDefaultSelectedCategories &&
      this.m_asDefaultSelectedCategories.length > 0
    ) {
      // Only select categories that exist in the options
      this.m_aoSelectedCategories = this.m_asDefaultSelectedCategories.filter(id =>
        this.m_asCategoryOptions.some(opt => opt.id === id)
      );
      this.m_oAppFilter.categories = this.m_aoSelectedCategories;
      this.m_oAppFilter.page = 0;
      this.m_oAppFilterOutput.emit(this.m_oAppFilter);
    }
  }


  getCategories(): void {
    let sCategoriesError = this.m_oTranslate.instant(
      'MSG_WAPPS_CATEGORY_ERROR'
    );
    this.m_oProcessorMediaService.getCategories().subscribe({
      next: (oResponse) => {
        if (oResponse.length === 0) {
          this.m_oNotificationDisplayService.openAlertDialog(sCategoriesError);
        }
        this.m_asCategoryOptions = oResponse;

        if (this.m_asDefaultSelectedCategories && this.m_asDefaultSelectedCategories.length > 0) {
          // Ensure only valid category IDs are selected
          this.m_aoSelectedCategories = this.m_asDefaultSelectedCategories.filter(id =>
            this.m_asCategoryOptions.some(opt => opt.id === id)
          );
          // Emit the filter with all default categories selected
          this.m_oAppFilter.categories = this.m_aoSelectedCategories;
          this.m_oAppFilter.page = 0;
          this.m_oAppFilterOutput.emit(this.m_oAppFilter);
        }
      },
      error: (oError) => {
        this.m_oNotificationDisplayService.openAlertDialog(sCategoriesError);
      },
    });
  }

  categoriesChanged(oEvent): void {
    let iCategoryIndex = this.m_aoSelectedCategories.indexOf(oEvent.id);

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
    let iDeveloperIndex = this.m_aoSelectedPublishers.indexOf(oEvent.publisher);
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
    let sErrorMsg: string = this.m_oTranslate.instant(
      'MSG_WAPPS_PUBLISHERS_ERROR'
    );
    this.m_oProcessorMediaService.getPublishersFilterList().subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoPublishers = oResponse;
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
        }
      },
      error: (oError) => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
      },
    });
  }

  ratingChanged(oEvent) {
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }

  /**
   * Handle Changes to the Search Input field on Enter or if Search Button clicked
   * @param oEvent
   * @returns {void}
   */
  onSearchInput(oEvent): void {

    this.m_oAppFilter.name = this.m_sSearchInput;
    this.m_oAppFilter.page = 0;
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }

  getSearchInput(oEvent) {
    this.m_sSearchInput = oEvent.event.target.value;

    // Handle user hitting enter to execute the search
    if (oEvent.event.key === 'Enter') {
      this.onSearchInput(oEvent);
    }
  }

  getDeveloperInput(oEvent) {
    this.m_sDeveloperSearch = oEvent.event.target.value;
  }

  clearFilters() {
    this.m_oAppFilter = {
      categories: [],
      publishers: [],
      name: '',
      score: 0,
      minPrice: -1,
      maxPrice: -1,
      itemsPerPage: 12,
      page: 0,
      orderBy: 'name',
      orderDirection: 1,
    };
    this.m_aoSelectedCategories = [];
    this.m_aoSelectedPublishers = [];
    this.m_sSearchInput = '';
    this.m_oAppFilterOutput.emit(this.m_oAppFilter);
  }
}
