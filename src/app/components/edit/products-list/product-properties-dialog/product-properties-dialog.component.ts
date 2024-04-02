import { Component, Inject } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';
import { StylesDialogComponent } from 'src/app/components/edit/edit-toolbar/toolbar-dialogs/styles-dialog/styles-dialog.component';
import { Product } from 'src/app/shared/models/product.model';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

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
  faX = faX;

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
  m_sWorkspaceId: string;
  m_bIsReadOnly: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ProductPropertiesDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService,
    private m_oDialog: MatDialog,
  ) {
    this.m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.getStyles();
    this.m_oProduct = this.m_oData.product
    this.m_oEditProduct.friendlyName = this.m_oData.product.productFriendlyName;
    this.m_oEditProduct.description = this.m_oData.product.description;
    this.m_oEditProduct.style = this.m_oData.product.style;
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
  }

  /**
   * Get the list of styles:
   */
  getStyles(): void {
    this.m_oStyleService.getStylesByUser().subscribe(
      {
        next: oResponse => {
          if (oResponse.length === 0) {
            this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION<br>ERROR GETTING STYLES")
          } else {
            this.m_asStyles = oResponse;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION<br>ERROR GETTING STYLES");
        }
      })
  }

  openStylesDialog(): void {
    this.m_oDialog.open(StylesDialogComponent, {
      height: '90vh',
      width: '90vw',
      minWidth: '90vw',
      
    })
  }

  /**
   * Get the Style name from the style object - if no name, return empty string and do not show in dropdown
   * @param oStyle 
   * @returns {string}
   */
  getStyleName(oStyle: Style): string {
    return oStyle && oStyle.name ? oStyle.name : "";
  }

  /**
   * Execute Update of Product Information
   * @returns {boolean}
   */
  updateProduct(): boolean {
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
    oUpdatedViewModel.style = this.m_oEditProduct.style.name;
    oUpdatedViewModel.description = this.m_oEditProduct.description;

    this.m_oProductService.updateProduct(oUpdatedViewModel, this.m_sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_oNotificationDisplayService.openSnackBar("Product Updated", "Close", "right", "bottom");
          this.onDismiss();
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION<br>ERROR: IMPOSSIBLE TO UPDATE THE PRODUCT");
        return false;
      }
    })
    return true;
  }

  /**
   * Handle dialog close
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
