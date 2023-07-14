import { Component } from '@angular/core';

//Angular Material Import: 
import { MatDialogRef } from '@angular/material/dialog';

//Service Imports:
import { AuthService } from 'src/app/services/auth/auth.service';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';

//Font Awesome Import: 
import { faUpload, faX } from '@fortawesome/free-solid-svg-icons';

//Model Imports
import { User } from 'src/app/shared/models/user.model';

//Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent {
  //Font Awesome Icon Imports
  faUpload = faUpload;
  faX = faX;

  m_sActiveTab: string = "upload"
  m_oUser: User = this.m_oConstantsService.getUser();
  m_bIsLoading: boolean = false;
  m_bIsUploading: boolean = false;
  m_sWorkspaceId: string = this.m_oConstantsService.getActiveWorkspace().workspaceId;
  m_oStyle: string = "";
  m_aoStylesMap: any = [];
  oControl;
  m_oFile: any;
  m_sFileName: string = "";

  constructor(
    private m_oAuthService: AuthService,
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ImportDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService) {

    this.getStyles();
  }

  changeActiveTab(sTabName: string) {
    if (sTabName) {
      this.m_sActiveTab = sTabName;
    }
  }

  getStyles() {
    this.m_oStyleService.getStylesByUser().subscribe(oResponse => {
      if (oResponse) {
        oResponse.map(oStyle => {
          this.m_aoStylesMap.push(oStyle.name)
        })
      }
    })
  }

  /*************** UPLOAD ***************/
  onFileSelect(input: any) {
    if (input.files && input.files[0]) {
      this.m_sFileName = input.files[0].name
      this.m_oFile = new FormData();
      this.m_oFile.append('file', input.files[0])
    }
  }

  onUploadFile() {

    this.m_bIsLoading = true;
    let sStyle = "";

    //Add paywalling in this area on subscriptions

    //Check for active workspace:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_sWorkspaceId)) {

    }

    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oFile)) {
      console.log("Please upload a file");
      return false;
    }

    //If the Style Input is filled apply the style: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oStyle) === false) {
      sStyle = this.m_oStyle;
    }

    var oBody = new FormData();
    oBody.append('file', this.m_oFile[0]);

    this.m_oProductService.uploadFile(this.m_sWorkspaceId, oBody, this.m_sFileName, sStyle).subscribe(oResponse => {
      if (oResponse.status !== 200) {
        let sErrorMsg: string = "GURU MEDITATION<br>ERROR IN UPLOADING FILE"
        this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, "Close", "right", "bottom");
      } else {
        let sMessage: string = "FILE UPLOADED";
        this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
        this.onDismiss();
      }
      this.cleanDragAndDrop();
      this.m_bIsUploading = false;
    }, oError => {
      let sErrorMessage: string = "ERROR IN UPLOADING FILE";
      this.m_bIsUploading = false;
      this.cleanDragAndDrop();
      this.m_oNotificationDisplayService.openSnackBar(sErrorMessage, "Close", "right", "bottom");
    })
    return true
  }

  /********************* SFTP ********************/
  deleteStfpAccount() {

  }

  updateStfpAccount() {

  }

  createAccountUpload() {

  }

  isCreatedAccountUpload() {

  }

  getListsFiles() {

  }

  isAccountCreated() {

  }

  ingestAllSelectedFiles() {

  }

  ingestFile() {

  }

  cleanDragAndDrop() {
    this.m_oFile = null;
  }
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
