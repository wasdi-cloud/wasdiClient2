import { Component, OnInit } from '@angular/core';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { Product } from 'src/app/shared/models/product.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  constructor(private oConstantsService: ConstantsService, private oProductService: ProductService) {


  }

  activeWorkspace: Workspace = {} as Workspace;
  productList: Product[];

  ngOnInit(): void {
    this.activeWorkspace = this.oConstantsService.getActiveWorkspace();
    this.getProductList();

  }

  getProductList() {
     this.oProductService.getProductListByWorkspace(this.activeWorkspace.workspaceId).subscribe(response => {
      this.productList = response
      console.log(this.productList)
    })
  }
}
