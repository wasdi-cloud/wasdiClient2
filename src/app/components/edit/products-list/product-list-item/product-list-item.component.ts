import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

import { ProductPropertiesDialogComponent } from '../product-properties-dialog/product-properties-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProductsListComponent } from '../products-list.component'
import { StylesDialogComponent } from '../../edit-toolbar/toolbar-dialogs/styles-dialog/styles-dialog.component';
import { WorkspacesListDialogComponent } from 'src/app/components/search/workspaces-list-dialog/workspaces-list-dialog.component';
import { ProductService } from 'src/app/services/api/product.service';
import { TranslateService } from '@ngx-translate/core';
import { MetadataAttributesDialogComponent } from '../metadata-attributes-dialog/metadata-attributes-dialog.component';



@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.css'],
})
export class ProductListItemComponent {
  @Input() m_oProduct: any = null;
  @Output() m_oProductChange: EventEmitter<any> = new EventEmitter();
  @Output() m_oProductInfoChange: EventEmitter<any> = new EventEmitter();
  @Output() m_oProductSelectionChange: EventEmitter<any> = new EventEmitter();

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
  m_bIsHovering?: boolean = false;

  /**
   * Flag to track whether or not the product is selected
   */
  @Input() m_bIsSelected: boolean = false;

  /**
   * Flag to track whether or not the product has metadata - possible change when user elects to get metadata
   */
  m_bHasMetadata: boolean = false;

  m_oProductMetadata: any = null;

  m_bShowMetadata: boolean = false;

  constructor(
    @Inject(ProductsListComponent) private m_oParentProductList: ProductsListComponent,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oCatalogService: CatalogService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oTranslate: TranslateService) {
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
   * Open the send to ftp dialog
   * @param oNode 
   */
  openSendToFTP() {
    this.m_oDialog.open(WorkspacesListDialogComponent, {
      height: "65vh",
      width: '40vw',
      data: {
        product: this.m_oProduct,
        sharing: true
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

  /**
   * Retrieve the product's metadata
   */
  getProductMetaData() {
    let sNoneFound: string = this.m_oTranslate.instant("METADATA_NONE")
    let sGenerating: string = this.m_oTranslate.instant("METADATA_GENERATING")
    if (this.m_bHasMetadata === false) {
      let sWorkspace = this.m_oConstantsService.getActiveWorkspace().workspaceId;
      this.m_oProductService.getProductMetadata(this.m_oProduct.fileName, sWorkspace).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oNotificationDisplayService.openAlertDialog(sNoneFound, "", "danger");
          } else {

            if (oResponse.attributes == null && oResponse.elements == null && oResponse.name.startsWith("Generating Metadata")) {
              this.m_oNotificationDisplayService.openAlertDialog(sGenerating, this.m_oTranslate.instant("IMPORT_TOOLTIP_INFO"), "alert");
            }
            else {
              this.m_bHasMetadata = true;
              this.m_oProductMetadata = oResponse;
              this.showMetadata(true)
            }
          }
        }
      })
    } else {
      this.showMetadata(true);
    }
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

  emitProductSelectionChange(oProduct: any, oEvent: any): void {
    let bChecked = oEvent.target.checked
    this.m_oProductSelectionChange.emit({
      product: this.m_oProduct,
      checked: bChecked
    });
  }

  openStylesDialog() {
    this.m_oDialog.open(StylesDialogComponent, {
      height: '90vh',
      width: '90vw',
      maxWidth: '1500px',
      data: { product: this.m_oProduct }
    })
  }

  showMetadata(bShowData: boolean) {
    this.m_bShowMetadata = !this.m_bShowMetadata
  }

  toggleMetadataOpen(oMetadata) {
    oMetadata.open = !oMetadata.open;
  }

  openElement(oElement) {
    oElement.open = !oElement.open
  }

  attributesDialog(oElement) {
    this.m_oDialog.open(MetadataAttributesDialogComponent, {
      data: {
        element: oElement
      },
      height: '600px',
      width: '550px'
    })
  }
}
