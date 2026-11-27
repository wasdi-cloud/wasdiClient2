import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
    selector: 'app-product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.css'],
    standalone: false
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
      this.m_aoPropertiesList = this.getPropertiesList();
    }
  }

  /**
   * Creates iterable object for displaying information in the view
   * @returns aoPropertiesList
   */
  getPropertiesList(): Array<any> {
    const aoPropertiesList = [];

    if (this.m_oProduct && this.m_oProduct.properties) {
      const oPropertyLabels = new Map<string, string>([
        ["beginposition", "Date"],
        ["instrumentshortname", "Instrument"],
        ["platformname", "Satellite"],
        ["sensoroperationalmode", "Mode"],
        ["relativeorbitnumber", "Relative orbit"],
        ["size", "Size"],
        ["polarisationmode", "Polarisation"],
        ["dataset", "Dataset"],
        ["productType", "Product type"],
        ["presureLevels", "Presure levels"],
        ["variables", "Variables"],
        ["format", "File format"]
      ]);

      for (const sKey of Object.keys(this.m_oProduct.properties)) {
        aoPropertiesList.push({
          "label": oPropertyLabels.get(sKey) ?? sKey,
          "value": this.m_oProduct.properties[sKey]
        });
      }
    }
    return aoPropertiesList;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
