import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from 'src/app/services/constants.service';
import { TranslateService } from '@ngx-translate/core';

// Window (in ms) within which an app is still considered "New" since its upload
const NEW_APP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
// Window (in ms) within which an app is still considered "Updated" since its last update
const UPDATED_APP_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css'],
    standalone: false
})
export class CardComponent {
  /**
   * The input object of the processor. 
   */
  @Input() m_oProcessor: any = {}

  constructor(
    private m_oConstantsService: ConstantsService, 
    private m_oRouter: Router,
    private m_oTranslateService: TranslateService
  ) { }

  openProcessorDetails(sProcessorName: string) {
    this.m_oConstantsService.setSelectedApplication(sProcessorName)
    this.m_oRouter.navigateByUrl(`${sProcessorName}/appDetails`)
  }

  getStyle() {
    if (this.m_oProcessor.price>0 || this.m_oProcessor.squareKilometerPrice>0) {
      return 'price-paid';
    }
    else {
      return 'price-free';
    }
  }

  getPrice() {
    let sMessage = "Free";

    this.m_oTranslateService.get("MARKET_CARD_PRICE").subscribe(sResponse => {
      sMessage = sResponse;
    });

        
    if (this.m_oProcessor.price>0) {
      return "€" + this.m_oProcessor.price;
    }
    else if (this.m_oProcessor.squareKilometerPrice>0) {
      return "€" + this.m_oProcessor.squareKilometerPrice+" / Km2";
    }
    else {
      return sMessage;
    }
  }

  /**
   * Returns 'updated', 'new' or null based on uploadDate/updateDate recency.
   * An "Updated" badge takes precedence over a "New" one.
   */
  getRecencyBadge(): 'updated' | 'new' | null {
    const iNow = Date.now();

    if (this.m_oProcessor.updateDate && (iNow - this.m_oProcessor.updateDate) < UPDATED_APP_WINDOW_MS) {
      return 'updated';
    }

    if (this.m_oProcessor.uploadDate && (iNow - this.m_oProcessor.uploadDate) < NEW_APP_WINDOW_MS) {
      return 'new';
    }

    return null;
  }
}
