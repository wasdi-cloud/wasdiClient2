import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

import { ProductPropertiesDialogComponent } from '../product-properties-dialog/product-properties-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProductsListComponent } from '../products-list.component'

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.css']
})
export class ProductListItemComponent implements OnInit {
  @Input() m_oProduct: any = null;

  /**
   * Flag to know if the actual product is open or closed.
   */
  m_bIsOpen: boolean = false;

  /**
   * Flag to know if the bands are shown or not
   */
  m_bShowBands: boolean = false;

  /**
   * Flag to know if the user is hovering with the mouse on this specific element
   */
  m_bIsHovering: boolean = false;

  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter();

  constructor( 
    @Inject(ProductsListComponent) private m_oParentProductList: ProductsListComponent,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oCatalogService: CatalogService,
    private m_oNotificationDisplayService: NotificationDisplayService )
  { 

  }

  ngOnInit(): void {
      console.log(this.m_oProduct);
  }
  /**
   * Clicked on the expand button
   */
  openProductBands() {
    this.m_bIsOpen = !this.m_bIsOpen;
  }

  /**
   * Clicked on the show bands button
   */
  openShowBands() {
    this.m_bShowBands = !this.m_bShowBands;
  }

  /**
   * Mouse entering on the item
   */
  mouseHovering() {
      this.m_bIsHovering = true;
  }

  /**
   * Mouse leaving the item
   */
  mouseLeaving() {
      this.m_bIsHovering = false;
  }  

  /**
   * Open Product Properties
   */
  openProductProperties() {
    this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: { product: this.m_oProduct }
    })
  }

  downloadProduct() {
    this.m_oParentProductList.downloadProductByName(this.m_oProduct.fileName);
  }

  deleteProduct() {
    this.m_oParentProductList.deleteProduct(this.m_oProduct);
  }  

  emitProductInfoChange() { }

}
