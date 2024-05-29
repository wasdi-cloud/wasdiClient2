import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Angular Materials Import:
import { MatDialog } from '@angular/material/dialog';

//Component Imports
import { NewAppDialogComponent } from '../../edit/edit-toolbar/toolbar-dialogs/new-app-dialog/new-app-dialog.component';

//Import Services:
import { ConstantsService } from 'src/app/services/constants.service';
import { ImageService } from 'src/app/services/api/image.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { TranslateService } from '@ngx-translate/core';

//Import Utilities:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

export interface application {
  buyed: boolean,
  friendlyName: string,
  imgLink: string,
  isMine: boolean,
  price: number,
  processorDescription: string,
  processorId: string,
  processorName: string,
  publisher: string,
  score: number,
  votes: number,
}
@Component({
  selector: 'app-app-details',
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.css'],
  host: { "class": "flex-fill" }
})
export class AppDetailsComponent implements OnInit {
  m_sActiveApplicationName: string = this.m_oConstantsService.getSelectedApplication();
  m_sActiveUser: string = "";
  m_oApplicationInfo: any = {} as application;

  m_bReviewsWaiting: boolean;
  m_sSelectedApplication: string;
  m_iReviewsPage: number;
  m_iReviewItemsPerPage: number;
  m_oReviewsWrapper: any;
  m_bShowLoadMoreReviews: boolean;

  m_asImages: Array<any> = [];

  m_sViewImage: string = ""

  m_oAppStats = {
    done: 0,
    error: 0,
    runs: 0,
    stopped: 0,
    uniqueUsers: 0,
    mediumTime: 0
  };


  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oImageService: ImageService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,
    private m_oRouter: Router) { }

  ngOnInit(): void {
    if (this.m_sActiveApplicationName) {
      this.getApplicationDetails(this.m_sActiveApplicationName)
    } else if (this.m_oActivatedRoute.snapshot.params['processorName']) {
      this.m_sActiveApplicationName = this.m_oActivatedRoute.snapshot.params['processorName']
      this.getApplicationDetails(this.m_sActiveApplicationName)
    }
    this.m_sActiveUser = this.m_oConstantsService.getUserId();
  }

  /**
   * Retrieve application details from the server
   * @param applicationName 
   */
  getApplicationDetails(applicationName: string): void {
    let sDataErrorMsg = this.m_oTranslate.instant("MSG_MKT_DATA_ERROR");
    this.m_oProcessorService.getMarketplaceDetail(applicationName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === true) {
          this.m_oNotificationDisplayService.openAlertDialog(sDataErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
        } else {
          this.m_oApplicationInfo = oResponse;
          this.getApplicationStats();
          if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oApplicationInfo.logo)) {
            this.m_asImages.push(this.m_oApplicationInfo.imgLink);
            this.m_sViewImage = this.m_asImages[0]
          } else {
            let sUrl = this.m_oImageService.getImageLink(this.m_oApplicationInfo.logo);
            this.m_asImages.push(sUrl);
            this.m_sViewImage = this.m_asImages[0]
          }

          if (this.m_oApplicationInfo.images.length > 0) {
            for (let iImage = 0; iImage < this.m_oApplicationInfo.images.length; iImage++) {
              let sImageUrl = this.m_oApplicationInfo.images[iImage];
              let sUrl = this.m_oImageService.getImageLink(sImageUrl);
              this.m_asImages.push(sUrl);
            }
            this.m_sViewImage = this.m_asImages[0]
          }
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sDataErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
      }
    });


  }

  /**
   * Retrieve the application's statistics from the server
   * @returns {void}
   */
  getApplicationStats(): void {
    let sErrorMsg = this.m_oTranslate.instant("MSG_MKT_STATS_ERROR")
    this.m_oProcessWorkspaceService.getProcessorStatistics(this.m_oApplicationInfo.processorName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
        } else {
          this.m_oAppStats = oResponse;
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
      }
    })
  }

  /**
   * Calculates the Success Rate as a Percentage String
   * @returns {string} 
   */
  getStatSuccess(): string {
    let dPerc = 1.0;

    if (this.m_oAppStats.runs > 0) {
      dPerc = this.m_oAppStats.done / this.m_oAppStats.runs;
    }

    dPerc *= 100;

    return dPerc.toFixed(1);
  }

  getCategories() { }

  /**
   * Return to the Marketplace
   * @returns {void}
   */
  marketplaceReturn(): void {
    this.m_oRouter.navigateByUrl('marketplace')
  }

  /**
   * Open the App UI page
   * @param processorName 
   * @returns {void}
   */
  openAppUI(processorName: string): void {
    this.m_oRouter.navigateByUrl(`${processorName}/appui`)
  }

  openEditAppDialog(oProcessor) {
    this.m_oDialog.open(NewAppDialogComponent, {
      height: '95vh',
      width: '95vw',
      minWidth: '95vw',
      maxWidth: '95vw',
      data: {
        editMode: true,
        inputProcessor: oProcessor
      }
    })
  }

  setViewImage(sImage) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sImage) === false) {
      this.m_sViewImage = sImage;
    }
  }
}
