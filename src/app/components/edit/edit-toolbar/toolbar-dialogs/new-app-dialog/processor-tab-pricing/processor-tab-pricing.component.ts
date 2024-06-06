import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-processor-tab-pricing',
  templateUrl: './processor-tab-pricing.component.html',
  styleUrls: ['./processor-tab-pricing.component.css']
})
export class ProcessorTabPricingComponent implements OnInit {
  @Input() m_oProcessorStoreInfo

  m_bIsFree: boolean = true;

  constructor() { }

  ngOnInit(): void {
    if (this.m_oProcessorStoreInfo) {
      if (this.m_oProcessorStoreInfo.value) {
        if (this.m_oProcessorStoreInfo.value.iOnDemandPrice == 0) this.m_bIsFree =true;
        else this.m_bIsFree = false;
      }
    }
  }

  patchShowInStore(oEvent) {
    console.log(oEvent.target.checked);
    this.m_oProcessorStoreInfo.patchValue({
      bShowInStore: oEvent.target.checked
    })
  }

  patchOnDemandPrice(oEvent) {
    console.log(oEvent.event.target.value)

    this.m_bIsFree = oEvent.event.target.value == 0;

    this.m_oProcessorStoreInfo.patchValue({
      iOnDemandPrice: oEvent.event.target.value
    })
  }
}
