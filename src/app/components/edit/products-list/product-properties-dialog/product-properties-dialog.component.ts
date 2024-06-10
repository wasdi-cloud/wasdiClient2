import { Component, Inject, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';
import { Product } from 'src/app/shared/models/product.model';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';

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
export class ProductPropertiesDialogComponent implements OnInit {
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

  m_oSelectedStyle: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oClipboard: Clipboard,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ProductPropertiesDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService,
    private m_oTranslate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getStyles();

    this.m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oProduct = this.m_oData.product
    this.m_oEditProduct.friendlyName = this.m_oData.product.productFriendlyName;
    this.m_oEditProduct.description = this.m_oData.product.description;
    this.m_oEditProduct.style.name = this.m_oData.product.style;
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
  }

  /**
   * Get the list of styles:
   */
  getStyles(): void {
    let sErrorHeader = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
    let sError = this.m_oTranslate.instant("DIALOG_PRODUCT_EDITOR_STYLE_ERROR")
    this.m_oStyleService.getStylesByUser().subscribe(
      {
        next: oResponse => {
          if (oResponse.length === 0) {
            this.m_oNotificationDisplayService.openAlertDialog(sError, sErrorHeader, 'danger')
          } else {
            this.m_asStyles = oResponse;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sError, sErrorHeader, 'danger');
        }
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
    let sErrorHeader = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION");
    let sErrorMsg = this.m_oTranslate.instant("DIALOG_PRODUCT_EDITOR_UPDATE_ERROR")
    let sSuccessMsg = this.m_oTranslate.instant("DIALOG_PRODUCT_EDITOR_UPDATE_SUCCESS")

    let oOldMetaData = this.m_oProduct.metadata;
    this.m_oProduct.metadata = null;

    let sStyle: any = "";
    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditProduct.style.name)) {
      sStyle = this.m_oEditProduct.style.name;
    } else {
      sStyle = this.m_oEditProduct.style;
    }

    this.m_oProduct.style = sStyle;

    let oUpdatedViewModel: Product = {} as Product;

    oUpdatedViewModel.fileName = this.m_oProduct.fileName;
    oUpdatedViewModel.productFriendlyName = this.m_oEditProduct.friendlyName;
    oUpdatedViewModel.style = this.m_oEditProduct.style.name
    oUpdatedViewModel.description = this.m_oEditProduct.description;

    this.m_oProductService.updateProduct(oUpdatedViewModel, this.m_sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_oNotificationDisplayService.openSnackBar(sSuccessMsg, '', 'success-snackbar');
          this.onDismiss(true);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sErrorHeader, 'danger');
        return false;
      }
    })
    return true;
  }

  setProductFriendlyName(oEvent: any) {
    this.m_oEditProduct.friendlyName = oEvent.event.target.value;
  }

  setStyleSelection(oEvent: any) {
    this.m_oEditProduct.style = oEvent;
    this.m_oSelectedStyle = oEvent;
  }

  setDescription(oEvent: any) {
    this.m_oEditProduct.description = oEvent.target.value;
  }

  copyToClipboard(sFileName: string) {
    let sCopied = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD")
    this.m_oClipboard.copy(sFileName);
    this.m_oNotificationDisplayService.openSnackBar(sCopied, '', 'success-snackbar');
  }
  /**
   * Handle dialog close
   */
  onDismiss(bIsChanged) {
    this.m_oDialogRef.close(bIsChanged);
  }
}
