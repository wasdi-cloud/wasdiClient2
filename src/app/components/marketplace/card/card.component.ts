import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from 'src/app/services/constants.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
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
}
