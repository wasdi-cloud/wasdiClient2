import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { StyleService } from 'src/app/services/api/style.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { JsonEditorService } from 'src/app/services/json-editor.service';
import { ProductService } from 'src/app/services/api/product.service';

interface Style {
  description: string,
  name: string,
  public: boolean,
  sharedWithMe: string,
  styleId: string,
  userId: string
}

@Component({
  selector: 'app-styles-dialog',
  templateUrl: './styles-dialog.component.html',
  styleUrls: ['./styles-dialog.component.css']
})
export class StylesDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') m_oEditorRef!: ElementRef;

  @Input() m_oProduct?: any;

  m_bDisplayInfo: boolean = false;
  m_sSearchString!: string;

  m_sActiveUserId: string;

  /**
   * String for switch case for viewable elements in second column of dialog
   */
  m_sActiveInputs: string = "default";

  m_sFileName: string = "";
  m_oFile: any = null;

  m_aoStyleList: any[] = [];
  m_oSelectedStyle: any = {} as Style;

  m_bIsCreatingStyle: boolean = false;

  m_bIsLoadingStyles: boolean = false;
  m_bIsLoadingStyleList: boolean = false;
  m_bIsJsonEditModeActive: boolean = false;

  //Model variable that contains the Xml of the style: 
  m_asStyleXml: string = "";

  //Support variable enabled when the xml is edited in the textarea
  m_bXmlEdited: boolean = false;

  m_oNewStyle = {
    styleName: "",
    styleDescription: "",
    isPublic: false,
    fileName: null
  }

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private m_oData: any,
    public m_oDialogRef: MatDialogRef<StylesDialogComponent>,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oJsonEditorService: JsonEditorService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService
  ) {
    this.m_sActiveUserId = m_oConstantsService.getUserId()
    this.getStylesByUser();
  }

  ngOnInit() {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData)) {
      this.m_oProduct = this.m_oData.product;

    }
  }

  ngAfterViewInit(): void {
    this.initXMLEditor();
  }


  filterStyles() {
    return this.m_aoStyleList.filter(oStyle => oStyle.name.includes(this.m_sSearchString));
  }

  getStylesByUser() {
    this.m_bIsLoadingStyles = true;
    this.m_oStyleService.getStylesByUser().subscribe(oResponse => {
      if (oResponse !== null && oResponse !== undefined) {
        this.m_aoStyleList = oResponse;

        if (!this.m_oSelectedStyle.name) {
          this.selectActiveStyle(this.m_aoStyleList[0]);
        }
      }
    });
  }

  setVisibleInput(sLabel: string) {
    this.m_sActiveInputs = sLabel;
  }

  selectActiveStyle(oStyle: Style) {
    this.m_oSelectedStyle = oStyle;
    this.m_asStyleXml = "";
    this.m_bDisplayInfo = true;
    if (oStyle) {
      if (oStyle.styleId) {
        this.getStyleXml(oStyle.styleId, oStyle.userId);
      }
    }
  }

  getStyleXml(sStyleId: string, sUserId: string) {
    this.m_oStyleService.getStyleXml(sStyleId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error in getting this style's XML")
        } else {
          this.m_asStyleXml = oResponse;
          this.m_oJsonEditorService.setText(this.m_asStyleXml);
          if (this.m_sActiveInputs === 'default') {
            this.m_oJsonEditorService.setReadOnly(true);
          }
        }
      }
    })
  }

  downloadStyle(sStyleId: string) {
    if (!sStyleId) {
      return false;
    }

    let sUrl: string;
    if (this.m_oConstantsService.getActiveWorkspace().apiUrl) {
      sUrl = this.m_oConstantsService.getActiveWorkspace().apiUrl;
    }

    this.m_oStyleService.downloadStyle(sStyleId, sUrl);
    return true;
  }

  deleteStyle(oStyle: any) {
    let sStyleId = oStyle.styleId;
    this.m_oNotificationDisplayService.openConfirmationDialog("Are you sure you wish to delete " + oStyle.name + "?").subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oStyleService.deleteStyle(sStyleId).subscribe(oResponse => {
          this.getStylesByUser();
          this.m_bDisplayInfo = false;
        });
      }
    })
  }

  handleToolbarClick(oEvent, oStyle) {
    if (oEvent === 'delete') {
      this.deleteStyle(oStyle)
    } else if (oEvent === 'edit') {
      this.setVisibleInput('edit-style');
      this.selectActiveStyle(oStyle);
      this.initEditInputs();
    } else if (oEvent === 'share') {
      this.setVisibleInput('share');
    } else if (oEvent === 'xml') {
      this.setVisibleInput('xml-editor')
      this.selectActiveStyle(oStyle);
      this.m_oJsonEditorService.setReadOnly(false);
    } else {
      this.downloadStyle(oStyle.styleId);
    }
  }

  getStyleImgLink(oStyle) {
    if (oStyle.imgLink) return oStyle.imgLink;
    else return "/assets/icons/style-placeholder.svg"
  }

  getInputChanges(oEvent: any, sLabel: string) {
    switch (sLabel) {
      case 'name':
        this.m_oNewStyle.styleName = oEvent.event.target.value;
        break;
      case 'description':
        this.m_oNewStyle.styleDescription = oEvent.target.value;
        break;
      case 'isPublic':
        this.m_oNewStyle.isPublic = oEvent.target.checked;
        break;
      case 'search':
        this.m_sSearchString = oEvent.event.target.value;
        break;
    }
  }

  /**
   * Handle changes to the drag and drop component and get them
   * @param oEvent 
   */
  getFile(oEvent) {
    this.m_sFileName = oEvent.name;
    this.m_oFile = oEvent.file
  }


  uploadStyle(oStyle: any) {
    this.m_bIsCreatingStyle = true;

    let oBody = new FormData();
    oBody.append('file', this.m_oFile);

    console.log(oBody)

    this.m_oStyleService.uploadFile(this.m_oNewStyle.styleName, this.m_oNewStyle.styleDescription, this.m_oFile, this.m_oNewStyle.isPublic).subscribe({
      next: oResponse => {
        if (oResponse && oResponse.boolValue == true) {
          this.m_oNotificationDisplayService.openSnackBar("STYLE UPLOADED");
        } else {
          this.m_oNotificationDisplayService.openAlertDialog("Error in uploading Style");
        }
        this.m_bIsCreatingStyle = false;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in uploading Style");
      }
    });
    return true;
  }

  /**
   * Update the visible information of a style (i.e., Name, Description, Visibility)
   * @returns void
   */
  updateStyleParams(): void {
    this.m_oStyleService.updateStyleParameters(this.m_oSelectedStyle.styleId, this.m_oNewStyle.styleDescription, this.m_oNewStyle.isPublic).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oFile)) {
          this.m_oStyleService.updateStyleFile(this.m_oSelectedStyle.styleId, this.m_oFile).subscribe({
            next: oResponse => {
              this.m_oNotificationDisplayService.openSnackBar("STYLE FILE UPDATED");
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Error in updating Style File");
            }
          })
        }
        //Reload Styles List
        this.m_oNotificationDisplayService.openSnackBar("Style Information Updated!");
        this.setVisibleInput("default")
        this.getStylesByUser();
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("There was an error when attempting to update this style.")
      }
    })
  }



  initEditInputs() {
    this.m_oNewStyle.styleName = this.m_oSelectedStyle.name;
    this.m_oNewStyle.styleDescription = this.m_oSelectedStyle.description;
    this.m_oNewStyle.isPublic = this.m_oSelectedStyle.public;
  }

  initXMLEditor() {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor();
    this.m_oJsonEditorService.setText(this.m_asStyleXml);
    this.m_oJsonEditorService.setReadOnly(true);
  }

  updateXml() {
    let oBody = new FormData();
    oBody.append('styleXml', this.m_asStyleXml);
    this.m_oStyleService.postStyleXml(this.m_oSelectedStyle.styleId, oBody).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Style XML updated")
        this.getStylesByUser();
        this.setVisibleInput('default');
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in updating the style XML.")
      }
    })
  }

  getXMLChange(oEvent) {
    this.m_asStyleXml = this.m_oJsonEditorService.getValue();
  }

  applyStyleToProduct() {
    this.m_oProduct.style = this.m_oSelectedStyle.name;
    let oProductViewModel = {
      description: this.m_oProduct.description,
      fileName: this.m_oProduct.fileName,
      productFriendlyName: this.m_oProduct.productFriendlyName,
      style: this.m_oSelectedStyle.name
    }

    let sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId

    this.m_oNotificationDisplayService.openConfirmationDialog(`Are you sure you want to update ${this.m_oProduct.friendlyName ? this.m_oProduct.friendlyName : this.m_oProduct.fileName} with the style ${this.m_oProduct.style}?`).subscribe(bDialogResult => {
      console.log(bDialogResult)
      console.log(this.m_oProduct)
      if (bDialogResult) {
        this.m_oProductService.updateProduct(oProductViewModel, sWorkspaceId).subscribe(oResponse => {
          if (oResponse.status === 200) {
            this.m_oNotificationDisplayService.openSnackBar("Product Style Updated!");
            this.onDismiss();
          }
        })
      }
    })
  }

  onDismiss(): void {
    this.m_oDialogRef.close();
  }
}