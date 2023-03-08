import { Component } from '@angular/core';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Product } from 'src/app/shared/models/product.model';

interface Style  {
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
    private m_oConstantsService: ConstantsService
  ) { 
    this.workspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId; 
    this.getStyle();
  }

  faClose = faX;
  m_oEditProduct = {
    friendlyName: "",
    description: "",
    style: {} as Style
  }

  m_oProduct: Product;
  m_asStyles: any[];
  m_bLoadingStyle: boolean = true;
  m_bProductChanged: boolean = false;
  workspaceId: string; 

  getStyle() {
    this.m_oStyleService.getStylesByUser().subscribe(oResponse => {
      console.log(oResponse)
      if(oResponse.length === 0) {
        //dialog communicating problem getting styles
     } 
     else {
        this.m_asStyles = oResponse; 
        console.log(this.m_asStyles)
      } 
    })
  }

  updateProduct(){
    if(!this.m_oProduct) {
      return false;
    }

    let oOldMetaData = this.m_oProduct.metadata; 
    this.m_oProduct.metadata = null; 

    let sStyle = "";
    if(this.m_oEditProduct.style) {
      sStyle = this.m_oEditProduct.style.name
    }

    this.m_oProduct.style = sStyle; 

    let oUpdatedViewModel: Product; 

    oUpdatedViewModel.fileName = this.m_oProduct.fileName; 
    oUpdatedViewModel.productFriendlyName = this.m_oProduct.fileName;
    oUpdatedViewModel.style = this.m_oProduct.style;
    oUpdatedViewModel.description = this.m_oProduct.description;

    this.m_oProductService.updateProduct(oUpdatedViewModel, this.workspaceId).subscribe(oResponse => {
      console.log(oResponse)
    })

    return true; 
  }
}
