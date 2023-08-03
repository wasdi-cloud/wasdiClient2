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

  m_asStyles: Array<string> = [];
  m_aoStylesMap: any = [];
  m_oFile: any;
  m_sFileName: string = "";

  m_aoListOfFiles: any = [];
  m_sEmailNewPassword: string = "";
  m_sEmailNewUser: string = "";

  m_bIsVisibleLoadIcon: boolean = false;
  m_aoSelectedFiles: Array<any> = [];

  m_bIsAccountCreated: boolean = false;


  constructor(
    private m_oAuthService: AuthService,
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ImportDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService) {

    this.getStyles();
    this.isCreatedAccountUpload();
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
      this.m_oFile.append('file', input.files[0]);
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

    this.m_oProductService.uploadFile(this.m_sWorkspaceId, this.m_oFile, this.m_sFileName, sStyle).subscribe(
      {
        next: (oResponse) => {
          if (oResponse.status !== 200) {
            let sErrorMsg: string = "GURU MEDITATION<br>ERROR IN UPLOADING FILE"
            this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, "Close", "right", "bottom");
          } else {
            let sMessage: string = "FILE UPLOADED";
            this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");
            //Clean Drag and Drop
            this.onDismiss();
          }
          this.m_bIsUploading = false;
        },
        error: (oError) => {
          let sErrorMessage: string = "ERROR IN UPLOADING FILE";
          this.m_bIsUploading = false;
          //Clean Drag and Drop
          this.m_oNotificationDisplayService.openSnackBar(sErrorMessage, "Close", "right", "bottom");
        }
      });
    return true
  }

  /********************* SFTP ********************/
  deleteStfpAccount() {
    //ADD FADEOUT UTILS:
    if (!this.m_oUser || !this.m_oUser.userId) {
      return false;
    }
    this.m_bIsVisibleLoadIcon = true;
    this.m_oAuthService.deleteAccountUpload(this.m_oUser.userId).subscribe({
      next: oResponse => {
        if (oResponse !== null && oResponse !== undefined) {
          this.isCreatedAccountUpload();
          this.m_bIsVisibleLoadIcon = false;
        }
      },
      error: oError => {
        //ADD ERROR DIALOG
        console.log(oError);
        console.log("Import Dialog Controller:  error during delete account");
        this.m_bIsVisibleLoadIcon = false;
      }
    })
    return true;
  }

  updateStfpPassword() {
    //FADEOUT UTILS OBJECT NULL 
    if (!this.m_sEmailNewPassword || !this.m_sEmailNewPassword) {
      return false;
    }

    this.m_bIsVisibleLoadIcon = true;
    this.m_oAuthService.updatePasswordUpload(this.m_sEmailNewPassword).subscribe({
      next: oResponse => {
        if (oResponse) {
          this.m_bIsVisibleLoadIcon = false;
        }
      },
      error: oError => {
        if (oError) {
          console.log("Import Dialog Controller:  error during creation new password");
        }
        this.m_bIsVisibleLoadIcon = false;
      }
    })
    return true;
  }

  createAccountUpload() {
    //ADD FADEOUT UTILS OBJECT NULL | STRING NULL | CHECK IS EMAIL
    if (!this.m_sEmailNewUser) {
      return false;
    }
    this.m_bIsVisibleLoadIcon;
    this.m_oAuthService.createAccountUpload(this.m_sEmailNewUser).subscribe({
      next: oResponse => {
        if (oResponse !== null && oResponse !== undefined) {
          this.isCreatedAccountUpload();
        } else {
          //CREATE ALERT DIALOG
          //ERROR SERVER WAS NOT ABLE TO CREATE AN ACCOUNT.
        }
      },
      error: oError => {
        //CREATE ALERT DIALOG
        //SERVER ERROR
        this.m_bIsVisibleLoadIcon = false;
      }
    });
    return true;
  }

  isCreatedAccountUpload() {
    this.m_oAuthService.isCreatedAccountUpload().subscribe({
      next: oResponse => {
        if (oResponse !== null && oResponse !== undefined) {
          this.m_bIsAccountCreated = false;
        } else {
          this.m_bIsAccountCreated = true;
          this.getListsFiles();
        }
      },
      error: oError => {
        if (oError) {
          console.log("Import Dialog Controller: : error during check if the account is created");
        }
      }
    })
  }

  getListsFiles() {
    this.m_oAuthService.getListFilesUpload().subscribe({
      next: oResponse => {
        if (oResponse !== null && oResponse !== undefined) {
          this.m_aoListOfFiles = oResponse;
        }
      },
      error: oError => {
        if (oError) {
          console.log("Import Dialog Controller: : error during get-list");
        }
      }
    })
  }

  isAccountCreated() {
    if(this.m_bIsAccountCreated) {
      return true;
    } 
    return false;
  }

  ingestAllSelectedFiles() {
    let iSelectedFilesLength = this.m_aoSelectedFiles.length; 

    for(let iSelectedFileIndex = 0; iSelectedFileIndex < iSelectedFilesLength; iSelectedFileIndex++) {
      if(this.ingestFile(this.m_aoSelectedFiles[iSelectedFileIndex]) === false) {
        console.log("Problem Ingesting file at index:" + iSelectedFileIndex);
      }
    }
  }

  ingestFile(oSelectedFile: any) {
    //FADEOUT UTILS: 
    if(!oSelectedFile) {
      return false;
    }
    this.m_oCatalogService.ingestFile(oSelectedFile, this.m_oConstantsService.getActiveWorkspace().workspaceId).subscribe({
      next: oResponse => {
        if(oResponse)
            {
                console.log("SftpUploadController error during ingest file");
                //TODO: ADD ALERT DIALOG
                console.log("GURU MEDITATION<br>INGESTION ERROR FILE:<br>" + oSelectedFile);
            }
      }, 
      error: oError => {
        console.log(oError); 
      }
    });
    return true;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
