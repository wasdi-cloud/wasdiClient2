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
    styleUrls: ['./import-dialog.component.css'],
    standalone: false
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
  m_aoPlatforms: Array<any> = [];
  m_oFile: any;
  m_sFileName: string = "";

  m_aoListOfFiles: any = [];
  m_sEmailNewPassword: string = "";
  m_sEmailNewUser: string = "";

  m_bIsVisibleLoadIcon: boolean = false;
  m_aoSelectedFiles: Array<any> = [];

  m_bIsReadOnly: boolean = true;

  m_oSelectedStyle: any = null;

  m_oSelectedPlatform: any = null;


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
    this.m_bIsReadOnly = this.m_oConstantsService.getActiveWorkspace().readOnly;
    this.getStyles();
    this.getPlatforms();
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

  getPlatforms() {
    this.m_oAuthService.getClientConfig().subscribe(oResponse => {
      if (oResponse) {
        let oClientConfig = oResponse as any;
        this.m_aoPlatforms = oClientConfig.missions;
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

  getSelectedPlatform(oEvent) {
    this.m_oSelectedPlatform = oEvent.value;
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

    let sPlatform= null;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedPlatform) === false) {
      sPlatform = this.m_oSelectedPlatform.indexvalue;
    }

    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_IMPORT_UPLOAD_ERROR")
    this.m_oProductService.uploadFile(this.m_sWorkspaceId, this.m_oFile, this.m_sFileName, sStyle, sPlatform).subscribe(
      {
        next: (oResponse) => {

          let sHeader: string = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
          if (oResponse.status !== 200) {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sHeader, 'danger');
          } 
          else {
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

  getFileInput(oEvent: any) {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent)) {
      this.m_oFile = oEvent;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }


}
