import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Import Services:
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
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
  styleUrls: ['./app-details.component.css']
})
export class AppDetailsComponent implements OnInit {
  sActiveApplicationName: string = this.oConstantsService.getSelectedApplication()
  sActiveApplicationInfo: any = {} as application;

  m_bReviewsWaiting: boolean;
  m_sSelectedApplication: string;
  m_iReviewsPage: number;
  m_iReviewItemsPerPage: number;
  m_oReviewsWrapper: any;
  m_bShowLoadMoreReviews: boolean;


  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oConstantsService: ConstantsService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService,
    private oRouter: Router) { }

  ngOnInit(): void {
    if (this.sActiveApplicationName) {
      this.getApplicationDetails(this.sActiveApplicationName)
    } else if (this.oActivatedRoute.snapshot.params['processorName']) {
      this.sActiveApplicationName = this.oActivatedRoute.snapshot.params['processorName']
      this.getApplicationDetails(this.sActiveApplicationName)
    }
  }

  //Get application details from server
  getApplicationDetails(applicationName: string) {
    return this.m_oProcessorService.getMarketplaceDetail(applicationName).subscribe(response => {
      this.sActiveApplicationInfo = response
    });
  }

  //Routing for back button
  marketplaceReturn() {
    this.oRouter.navigateByUrl('marketplace')
  }

  //Routing for opening AppUI page
  openAppUI(processorName: string) {
    this.oRouter.navigateByUrl(`${processorName}/appui`)
  }
}
