import {Component, Input, OnDestroy, OnInit} from '@angular/core';

//Angular Material Import:
import {MatDialogRef} from '@angular/material/dialog';

//Service Imports:
import {AuthService} from 'src/app/auth/service/auth.service';
import {CatalogService} from 'src/app/services/api/catalog.service';
import {ConstantsService} from 'src/app/services/constants.service';
import {NotificationDisplayService} from 'src/app/services/notification-display.service';
import {ProductService} from 'src/app/services/api/product.service';
import {StyleService} from 'src/app/services/api/style.service';

//Model Imports
import {User} from 'src/app/shared/models/user.model';

//Utilities Import:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import {TranslateService} from '@ngx-translate/core';
import {FileUploadService} from "../../upload-file-service/FileUploadService";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class  ImportDialogComponent implements OnInit, OnDestroy {


  m_sActiveTab: string = "upload"

  m_oUser: User = this.m_oConstantsService.getUser();

  m_bIsLoading: boolean = false;
  m_bIsUploading: boolean = false;
  private subscription: Subscription;
  m_oWorkspace: any = this.m_oConstantsService.getActiveWorkspace();

  m_sWorkspaceId: string = this.m_oConstantsService.getActiveWorkspace().workspaceId;

  m_aoStyles: Array<any> = [];
  m_oFile: any;
  m_sFileName: string = "";

  m_aoListOfFiles: any = [];
  m_sEmailNewPassword: string = "";
  m_sEmailNewUser: string = "";

  m_bIsVisibleLoadIcon: boolean = false;
  m_aoSelectedFiles: Array<any> = [];

  m_bIsAccountCreated: boolean = false;

  m_bIsReadOnly: boolean = true;

  m_oSelectedStyle: any = null;


  constructor(
    private m_oAuthService: AuthService,
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ImportDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oStyleService: StyleService,
    private m_oTranslate: TranslateService,
    private m_fileUploadService: FileUploadService) {
  }

  ngOnInit(): void {
    this.subscription = this.m_fileUploadService.isUploading$.subscribe(
      (status: boolean) => {
        this.m_bIsUploading = status;
      }
    );
    console.log('her i am open again')
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
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
        this.m_aoStyles = oResponse
      }
    })
  }

  /*************** UPLOAD ***************/
  getSelectedFile(oEvent) {
    this.m_sFileName = oEvent.name;
    this.m_oFile = oEvent.file
  }

  getSelectedStyle(oEvent) {
    this.m_oSelectedStyle = oEvent.value;
  }

  onUploadFile() {
    // this.m_bIsLoading = true;
    this.m_fileUploadService.startUpload();
    let sStyle = "";

    //Add paywalling in this area on subscriptions
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === false) {
      let sNoSubscription: string = this.m_oTranslate.instant("ACTIVE_SUBSCRIPTION_ERROR")
      this.m_oNotificationDisplayService.openAlertDialog(sNoSubscription, '', 'alert');
      return false;
    }

    if (this.m_bIsReadOnly === true) {
      let sNoPermission: string = this.m_oTranslate.instant("DIALOG_IMPORT_READONLY");
      this.m_oNotificationDisplayService.openAlertDialog(sNoPermission, '', 'alert');
    }

    //Check for active workspace:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_sWorkspaceId)) {

    }

    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oFile)) {
      console.log("Please upload a file");
      return false;
    }

    //If the Style Input is filled apply the style:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedStyle) === false) {
      sStyle = this.m_oSelectedStyle.name;
    }

    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_IMPORT_UPLOAD_ERROR")
    this.m_oProductService.uploadFile(this.m_sWorkspaceId, this.m_oFile, this.m_sFileName, sStyle).subscribe(
      {
        next: (oResponse) => {

          let sHeader: string = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
          if (oResponse.status !== 200) {
            console.log(this.m_sFileName + "here is !=200")
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sHeader, 'danger');
          } else {
            console.log(this.m_sFileName + "here is ==200")
            let sMessage: string = this.m_oTranslate.instant("KEY_PHRASES.SUCCESS");
            this.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar');
            this.onDismiss();
          }
          this.m_fileUploadService.finishUpload();

        },
        error: (oError) => {
          this.m_fileUploadService.finishUpload();
          this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, '', 'danger');
        }
      });
    return true
  }

  ngOnDestroy() {
    // Clean up the subscription to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    if (this.m_bIsAccountCreated) {
      return true;
    }
    return false;
  }

  ingestAllSelectedFiles() {
    let iSelectedFilesLength = this.m_aoSelectedFiles.length;

    for (let iSelectedFileIndex = 0; iSelectedFileIndex < iSelectedFilesLength; iSelectedFileIndex++) {
      if (this.ingestFile(this.m_aoSelectedFiles[iSelectedFileIndex]) === false) {
        console.log("Problem Ingesting file at index:" + iSelectedFileIndex);
      }
    }
  }

  ingestFile(oSelectedFile: any) {
    //FADEOUT UTILS:
    if (!oSelectedFile) {
      return false;
    }
    this.m_oCatalogService.ingestFile(oSelectedFile, this.m_oConstantsService.getActiveWorkspace().workspaceId).subscribe({
      next: oResponse => {
        if (oResponse) {
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

  getFileInput(oEvent: any) {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent)) {
      this.m_oFile = oEvent;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }


}
