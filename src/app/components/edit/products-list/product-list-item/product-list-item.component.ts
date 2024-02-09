import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ProductPropertiesDialogComponent } from '../product-properties-dialog/product-properties-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.css']
})
export class ProductListItemComponent implements OnInit {
  @Input() m_oProduct: any = null;

  m_bIsOpen: boolean = false;

  m_bShowBands: boolean = false;

  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter(); 

  constructor(
    private m_oDialog: MatDialog
  ) { }

  ngOnInit(): void {

    console.log(this.m_oProduct.bandsGroups)

  }

  openProductBands() {
    this.m_bIsOpen = !this.m_bIsOpen;
  }

  openShopwBands() {
    this.m_bShowBands = !this.m_bShowBands;
  }

  openDropdown() { }

  openProductProperties() {
    this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: { product: this.m_oProduct }
    })
  }

  emitProductInfoChange() { }

}
