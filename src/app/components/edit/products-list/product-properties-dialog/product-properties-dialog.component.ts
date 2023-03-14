import { Component, Inject } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { Product } from 'src/app/shared/models/product.model';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { faX } from '@fortawesome/free-solid-svg-icons';

interface Style {
  description: string,
  name: string,
  sharedWithMe: boolean,
  styleId: string,
  userId: string
}
@Component({
  selector: 'app-product-properties-dialog',
  templateUrl: './product-properties-dialog.component.html',
  styleUrls: ['./product-properties-dialog.component.css']
})
export class ProductPropertiesDialogComponent {

  constructor(
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService,
    private m_oConstantsService: ConstantsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.workspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.getStyle();
    console.log(data.product)
    this.m_oProduct = data.product
    this.m_oEditProduct.friendlyName = data.product.productFriendlyName;
    this.m_oEditProduct.description = data.product.description;
    this.m_oEditProduct.style = data.product.style;
  }

  faClose = faX;
  m_oEditProduct = {
    friendlyName: "",
    description: "",
    style: {
      description: "",
      name: "",
      sharedWithMe: false,
      styleId: "",
      userId: ""
    }
  }

  m_oProduct: Product;
  m_asStyles: any[];
  m_bLoadingStyle: boolean = true;
  m_bProductChanged: boolean = false;
  workspaceId: string;

  getStyle() {
    this.m_oStyleService.getStylesByUser().subscribe(oResponse => {
      if (oResponse.length === 0) {
        //dialog communicating problem getting styles
      }
      else {
        this.m_asStyles = oResponse;
      }
    })
  }

  getStyleName(oStyle: Style) {
    return oStyle && oStyle.name ? oStyle.name : "";
  }

  updateProduct() {
    let oOldMetaData = this.m_oProduct.metadata;
    this.m_oProduct.metadata = null;

    let sStyle = "";
    if (this.m_oEditProduct.style) {
      sStyle = this.m_oEditProduct.style.name
    }
    this.m_oProduct.style = sStyle;

    let oUpdatedViewModel: Product = {} as Product;

    oUpdatedViewModel.fileName = this.m_oProduct.fileName;
    oUpdatedViewModel.productFriendlyName = this.m_oEditProduct.friendlyName;
    oUpdatedViewModel.style = this.m_oEditProduct.style;
    oUpdatedViewModel.description = this.m_oEditProduct.description;

    console.log(oUpdatedViewModel)
    this.m_oProductService.updateProduct(oUpdatedViewModel, this.workspaceId).subscribe(oResponse => {
      if (oResponse.status === 200) {
        console.log("Updated!")
      }
    })

    return true;
  }
}
