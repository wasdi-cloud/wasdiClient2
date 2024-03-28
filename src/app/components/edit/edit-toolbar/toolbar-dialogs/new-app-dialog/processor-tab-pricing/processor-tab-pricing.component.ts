import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-processor-tab-pricing',
  templateUrl: './processor-tab-pricing.component.html',
  styleUrls: ['./processor-tab-pricing.component.css']
})
export class ProcessorTabPricingComponent implements OnInit {
  @Input() m_oProcessorStoreInfo

  constructor() { }

  ngOnInit(): void {
    console.log(this.m_oProcessorStoreInfo)
  }

  patchShowInStore(oEvent) {
    console.log(oEvent.target.checked);
    this.m_oProcessorStoreInfo.patchValue({
      bShowInStore: oEvent.target.checked
    })
  }

  patchOnDemandPrice(oEvent) {
    console.log(oEvent.event.target.value)
    this.m_oProcessorStoreInfo.patchValue({
      iOnDemandPrice: oEvent.event.target.value
    })
  }
}
