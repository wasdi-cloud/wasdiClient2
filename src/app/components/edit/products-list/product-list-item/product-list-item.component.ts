import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

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
export class ProductListItemComponent {
  @Input() m_oProduct: any = null;
  @Output() m_oProductChange: EventEmitter<any> = new EventEmitter();
  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter();

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


  constructor(
    @Inject(ProductsListComponent) private m_oParentProductList: ProductsListComponent,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oCatalogService: CatalogService,
    private m_oNotificationDisplayService: NotificationDisplayService) {
  }

  ngOnChanges(changes: SimpleChanges): void {

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
    let oDialog = this.m_oDialog.open(ProductPropertiesDialogComponent, {
      data: { product: this.m_oProduct },
      height: '70vh',
      width: '40vw'
    })

    oDialog.afterClosed().subscribe(oResponse => {
      if (oResponse === true) {
        this.m_oProductInfoChange.emit(true);
      }
    })
  }

  /**
   * Event to show product on Map
   */
  showBandsOnMap(oSelectedBand, bShowOnMap: boolean) {
    this.emitBandSelectionChange(oSelectedBand)
    //Find Band in Product's bandsGroups Array
    this.m_oProduct.bandsGroups.bands.forEach(oBand => {
      //Set Band.published = true
      if (oBand.name === oSelectedBand.name) {
        oBand.published = bShowOnMap
      }
    });

  }

  downloadProduct() {
    this.m_oParentProductList.downloadProductByName(this.m_oProduct.fileName);
  }

  deleteProduct() {
    this.m_oParentProductList.deleteProduct(this.m_oProduct);
  }

  emitBandSelectionChange(oBand: any): void {
    this.m_oProductChange.emit(oBand);
  }
}
