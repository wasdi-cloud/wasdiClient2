import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-processor-tab-pricing',
  templateUrl: './processor-tab-pricing.component.html',
  styleUrls: ['./processor-tab-pricing.component.css']
})
export class ProcessorTabPricingComponent implements OnInit {
  /**
   * Form input for the store information
   */
  @Input() m_oProcessorStoreInfo

  /**
   * Flag to track if the app is free
   */
  m_bIsFree: boolean = true;

  /**
   * Intended price
   */
  m_iOnDemandPrice: number = 0;

  /**
   * Placeholder for original price (used when toggling free/paid)
   */
  m_iOriginalPrice: number = 0;

  m_iPricePerSquareKm: number = 0;

  m_sAreaParameterName: string = "";

  constructor() { }

  ngOnInit(): void {
    if (this.m_oProcessorStoreInfo) {
      if (this.m_oProcessorStoreInfo.value) {
        if (this.m_oProcessorStoreInfo.value.iOnDemandPrice <= 0 && this.m_oProcessorStoreInfo.value.iPricePerSquareKm<=0) {
          this.m_bIsFree = true;
        } else {
          this.m_bIsFree = false;
          this.m_iOnDemandPrice = this.m_oProcessorStoreInfo.value.iOnDemandPrice;
          this.m_iOriginalPrice = this.m_oProcessorStoreInfo.value.iOnDemandPrice;
          this.m_iPricePerSquareKm = this.m_oProcessorStoreInfo.value.iPricePerSquareKm;
          this.m_sAreaParameterName = this.m_oProcessorStoreInfo.value.sAreaParameterName;
        }
      }
    }
  }

  patchShowInStore(oEvent) {
    this.m_oProcessorStoreInfo.patchValue({
      bShowInStore: oEvent.target.checked
    })
  }

  patchOnDemandPrice(oEvent) {
    this.m_bIsFree = oEvent.event.target.value === 0;

    this.m_iOriginalPrice = oEvent.event.target.value;

    this.m_oProcessorStoreInfo.patchValue({
      iOnDemandPrice: oEvent.event.target.value
    })
  }

  patchPricePerKm(oEvent) {
    //this.m_bIsFree = oEvent.event.target.value === 0;

    this.m_iPricePerSquareKm = oEvent.event.target.value;

    this.m_oProcessorStoreInfo.patchValue({
      iPricePerSquareKm: oEvent.event.target.value
    })
  }

  patchAreaParamName(oEvent) {
    //this.m_bIsFree = oEvent.event.target.value === 0;

    this.m_sAreaParameterName = oEvent.event.target.value;

    this.m_oProcessorStoreInfo.patchValue({
      sAreaParameterName: oEvent.event.target.value
    })
  }

  getFreeStatus(oEvent) {
    this.m_bIsFree = oEvent.target.checked

    if (this.m_bIsFree === true) {
      this.m_iOnDemandPrice = 0;
      this.m_oProcessorStoreInfo.patchValue({
        iOnDemandPrice: 0
      })
    } else {
      this.m_iOnDemandPrice = this.m_iOriginalPrice
    }
  }
}
