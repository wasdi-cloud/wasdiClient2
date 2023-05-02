import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faUpload, faX } from '@fortawesome/free-solid-svg-icons';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ProductService } from 'src/app/services/api/product.service';
import { StyleService } from 'src/app/services/api/style.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';

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
      console.log(this.m_oFile)
    }
  }

  onUploadFile() {
    console.log(this.m_oFile)
    //Add paywalling in this area on subscriptions

    if (!this.m_sWorkspaceId) {
      return false;
    }

    this.m_bIsLoading = true;

    let sStyle = "";

    if (this.m_oStyle) {
      sStyle = this.m_oStyle;
    }

    console.log(this.m_sFileName)
    this.m_oProductService.uploadFile(this.m_sWorkspaceId, this.m_oFile, this.m_sFileName, sStyle).subscribe(oResponse => {
      console.log(oResponse);
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
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
