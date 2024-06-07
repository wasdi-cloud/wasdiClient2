import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit {
  m_oProduct: any = null;

  m_aoPropertiesList: Array<any> = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<ProductInfoComponent>
  ) { }

  ngOnInit(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData.product) === false) {
      this.m_oProduct = this.m_oData.product;
      console.log(this.m_oProduct)
      this.m_aoPropertiesList = this.getPropertiesList();
      this.m_aoPropertiesList
    }
  }

  /**
   * Creates iterable object for displaying information in the view
   * @returns aPropertiesList
   */
  getPropertiesList(): Array<any> {
    let aPropertiesList = [];

    if (this.m_oProduct && this.m_oProduct.properties) {
      if (this.m_oProduct.properties.beginposition) {
        aPropertiesList.push({ "label": "Date", "value": this.m_oProduct.properties.beginposition });
      }

      if (this.m_oProduct.properties.instrumentshortname) {
        aPropertiesList.push({ "label": "Instrument", "value": this.m_oProduct.properties.instrumentshortname });
      }

      if (this.m_oProduct.properties.platformname) {
        aPropertiesList.push({ "label": "Satellite", "value": this.m_oProduct.properties.platformname });
      }

      if (this.m_oProduct.properties.sensoroperationalmode) {
        aPropertiesList.push({ "label": "Mode", "value": this.m_oProduct.properties.sensoroperationalmode });
      }

      if (this.m_oProduct.properties.relativeorbitnumber) {
        aPropertiesList.push({ "label": "Relative orbit", "value": this.m_oProduct.properties.relativeorbitnumber });
      }

      if (this.m_oProduct.properties.size) {
        aPropertiesList.push({ "label": "Size", "value": this.m_oProduct.properties.size });
      }

      if (this.m_oProduct.properties.polarisationmode) {
        aPropertiesList.push({ "label": "Polarisation", "value": this.m_oProduct.properties.polarisationmode });
      }

      if (this.m_oProduct.properties.dataset) {
        aPropertiesList.push({ "label": "Dataset", "value": this.m_oProduct.properties.dataset });
      }

      if (this.m_oProduct.properties.productType) {
        aPropertiesList.push({ "label": "Product type", "value": this.m_oProduct.properties.productType });
      }

      if (this.m_oProduct.properties.presureLevels) {
        aPropertiesList.push({ "label": "Presure levels", "value": this.m_oProduct.properties.presureLevels });
      }

      if (this.m_oProduct.properties.variables) {
        aPropertiesList.push({ "label": "Variables", "value": this.m_oProduct.properties.variables });
      }

      if (this.m_oProduct.properties.format) {
        aPropertiesList.push({ "label": "File format", "value": this.m_oProduct.properties.format });
      }

    }
    return aPropertiesList;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
