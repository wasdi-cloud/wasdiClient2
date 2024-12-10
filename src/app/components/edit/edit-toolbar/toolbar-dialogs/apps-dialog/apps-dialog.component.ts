import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';

//Angular Materials Modules:
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { ImageService } from 'src/app/services/api/image.service';

//Components Imports:
import { NewAppDialogComponent } from '../new-app-dialog/new-app-dialog.component';
import { ParamsLibraryDialogComponent } from './params-library-dialog/params-library-dialog.component';

//Fadeout Utilities Import:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Application } from 'src/app/components/app-ui/app-ui.component';
import { JsonEditorService } from 'src/app/services/json-editor.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-apps-dialog',
  templateUrl: './apps-dialog.component.html',
  styleUrls: ['./apps-dialog.component.css'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('500ms ease-in', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(100%)' })),
      ]),
    ]),
  ],
})
export class AppsDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editor') m_oEditorRef!: ElementRef;

  m_sActiveUserId: string = '';
  m_aoWorkspaceList: any[] = [];
  m_aWorkspacesName: any[] = [];
  m_aoSelectedWorkspaces: any[] = [];
  m_sFileName: string = '';
  m_aoProcessorList: any[] = [];
  m_bIsLoadingProcessorList: boolean = true;
  m_bIsJsonEditModeActive: boolean = false;
  m_sJson: any = {};
  m_sMyJsonString: string = '';
  m_sSearchString = '';
  m_oSelectedProcessor: any = {} as Application;
  m_bIsReadonly: boolean = true;
  m_iHookIndex: Number = -1;

  m_bShowHelpMessage: boolean = false;
  m_sHelpMsg: string = '';

  m_bShowParamsLibrary: boolean = false;

  m_bNotification: boolean = false;
  /**
   * If the app has been purchased (1 time run) - if the app is Free, remains TRUE
   */
  m_bIsPurchased: boolean = true;

  m_oAppPaymentVM: any = null;
  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<AppsDialogComponent>,
    private m_oJsonEditorService: JsonEditorService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oImageService: ImageService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {
    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook(
      'DELETEPROCESSOR',
      this,
      this.rabbitMessageHook
    );
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    this.m_bIsReadonly = this.m_oConstantsService.getActiveWorkspace().readOnly;
    this.getProcessorsList();
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }

  ngAfterViewInit(): void {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor();
    this.m_oJsonEditorService.setText(this.m_sMyJsonString);
  }

  /**
   * Get the list of processors from the server
   */
  getProcessorsList() {
    let sErrorMsg: string = this.m_oTranslate.instant(
      'DIALOG_APPS_PROCESSORS_ERROR'
    );
    this.m_oProcessorService.getProcessorsList().subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoProcessorList = this.setDefaultImages(oResponse);
          this.m_bIsLoadingProcessorList = false;
        } else {
          this.m_oNotificationDisplayService.openAlertDialog(
            sErrorMsg,
            '',
            'danger'
          );
        }
      },
      error: (oError) => {
        this.m_oNotificationDisplayService.openAlertDialog(
          sErrorMsg,
          '',
          'danger'
        );
      },
    });
  }

  /**
   * If the processor has a default image, set as image - otherwise use default image
   * @param aoProcessorList
   * @returns
   */
  setDefaultImages(aoProcessorList) {
    if (!aoProcessorList) {
      return aoProcessorList;
    }

    let sDefaultImage = 'assets/wasdi/miniLogoWasdi.png';
    let iNumberOfProcessors = aoProcessorList.length;

    for (
      let iIndexProcessor = 0;
      iIndexProcessor < iNumberOfProcessors;
      iIndexProcessor++
    ) {
      if (!aoProcessorList[iIndexProcessor].imgLink) {
        aoProcessorList[iIndexProcessor].imgLink = sDefaultImage;
      }
      this.m_oImageService.updateProcessorLogoImageUrl(
        aoProcessorList[iIndexProcessor]
      );
    }
    return aoProcessorList;
  }

  /**
   * Set selected processor as active processor
   * @param oProcessor
   */
  selectProcessor(oProcessor) {
    this.m_oSelectedProcessor = oProcessor;
    this.m_oProcessorService
      .getHelpFromProcessor(oProcessor.processorName)
      .subscribe({
        next: (oResponse) => {
          this.m_sHelpMsg = oResponse.stringValue;
        },
      });

    this.m_oProcessorService
      .getIsAppPurchased(this.m_oSelectedProcessor.processorId)
      .subscribe({
        next: (oResponse) => {
          this.m_bIsPurchased = oResponse;
        },
        error: (oError) => {},
      });
    if (oProcessor.paramsSample) {
      this.m_sMyJsonString = decodeURIComponent(oProcessor.paramsSample);
      this.m_oJsonEditorService.setText(this.m_sMyJsonString);
      try {
        let oParsed = JSON.parse(this.m_sMyJsonString);

        let sPrettyPrint = JSON.stringify(oParsed, null, 2);

        this.m_sMyJsonString = sPrettyPrint;
      } catch (oError) {}
    } else {
      this.m_sMyJsonString = '';
    }
  }

  /**
   * Open the Processor Parameters Dialog
   * @param oEvent
   * @param oProcessor
   */
  openParametersDialog(oProcessor) {
    let oDialog = this.m_oDialog.open(ParamsLibraryDialogComponent, {
      height: '80vh',
      width: '80vw',
      data: oProcessor,
    });

    oDialog.afterClosed().subscribe((oResult) => {
      if (oResult) {
        this.m_sMyJsonString = decodeURIComponent(oResult.jsonParameters);
      }
    });
  }

  /**
   * Download the Processor file
   * @param oEvent
   * @param oProcessor
   * @returns
   */
  downloadProcessor(oProcessor: any) {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oProcessor)) {
      // return false;
    }

    return this.m_oProcessorService.downloadProcessor(oProcessor.processorId);
  }

  /**
   * Open Processor Editing Dialog
   * @param oEvent
   * @param oProcessor
   */
  openEditProcessorDialog(oProcessor: any) {
    this.m_oDialog
      .open(NewAppDialogComponent, {
        height: '95vh',
        width: '95vw',
        minWidth: '95vw',
        data: {
          editMode: true,
          inputProcessor: oProcessor,
        },
      })
      .afterClosed()
      .subscribe((oChanged) => {
        if (oChanged.changed || oChanged === true) {
          this.getProcessorsList();
          if (
            this.m_oSelectedProcessor.processorId === oProcessor.processorId
          ) {
            this.m_oSelectedProcessor = {} as Application;
          }
        }
      });
  }

  openNewAppDialog(): void {
    this.m_oDialog
      .open(NewAppDialogComponent, {
        height: '95vh',
        width: '95vw',
        maxWidth: '95vw',
        data: { editMode: false },
      })
      .afterClosed()
      .subscribe((oChanged) => {
        if (oChanged.changed) {
          this.getProcessorsList();
        }
      });
  }

  /**
   * Either Delete the processor or remove user permissions
   * @param oEvent
   * @param oProcessor
   * @returns
   */
  removeProcessor(oProcessor: any) {
    if (!oProcessor) {
      return false;
    }
    let sConfirmHeader: string = this.m_oTranslate.instant(
      'KEY_PHRASES.CONFIRM_REMOVAL'
    );

    let sConfirmOwner = `${this.m_oTranslate.instant(
      'DIALOG_APPS_DELETE_OWNER'
    )}<li> ${oProcessor.processorName}</li>`;
    let sConfirmShared = `${this.m_oTranslate.instant(
      'DIALOG_APPS_DELETE_SHARED'
    )}<li> ${oProcessor.processorName}</li>`;

    let sDeleteErrorMsg: string = this.m_oTranslate.instant(
      'DIALOG_APPS_ERROR_DELETE'
    );

    let bConfirmResult: any;

    if (oProcessor.sharedWithMe) {
      bConfirmResult =
        this.m_oNotificationDisplayService.openConfirmationDialog(
          sConfirmShared,
          sConfirmHeader,
          'alert'
        );
    } else {
      bConfirmResult =
        this.m_oNotificationDisplayService.openConfirmationDialog(
          sConfirmOwner,
          sConfirmHeader,
          'alert'
        );
    }

    bConfirmResult.subscribe((bDialogResult) => {
      if (bDialogResult === true) {
        this.m_bIsLoadingProcessorList = true;
        this.m_oProcessorService
          .deleteProcessor(oProcessor.processorId)
          .subscribe({
            next: (oResponse) => {
              //Next actions are handled on RabbitMessageHook function
            },
            error: (oError) => {
              this.m_oNotificationDisplayService.openAlertDialog(
                sDeleteErrorMsg,
                '',
                'danger'
              );
            },
          });
      }
    });
    return true;
  }

  /**
   * Format the JSON textbox
   */
  formatJSON() {
    let sJsonError = this.m_oTranslate.instant('DIALOG_FORMAT_JSON_ERROR');
    try {
      console.log('JSON');
      this.m_sMyJsonString = JSON.stringify(
        JSON.parse(this.m_sMyJsonString.replaceAll("'", '"')),
        null,
        3
      );
      this.m_oJsonEditorService.setText(this.m_sMyJsonString);
    } catch (oError) {
      this.m_oNotificationDisplayService.openAlertDialog(
        sJsonError,
        '',
        'alert'
      );
    }
  }

  /**
   * Execute the processor in the active workspace
   */
  runProcessor() {
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === false) {
      return false;
    }

    if (this.m_bIsReadonly === true) {
      let sCannotEditMsg: string = this.m_oTranslate.instant(
        'DIALOG_APPS_CANNOT_EDIT'
      );
      this.m_oNotificationDisplayService.openAlertDialog(
        sCannotEditMsg,
        '',
        'alert'
      );
      return false;
    }

    if (!this.m_bIsPurchased) {
      return false;
    }
    console.log(`RUN - ${this.m_oSelectedProcessor.processorName}`);

    let sJSON = this.m_sMyJsonString;
    let sStringJSON = '';

    // Ensure that the JSON has been transformed into a STRING type
    if (typeof sJSON !== 'string') {
      sStringJSON = JSON.stringify(sJSON);
    } else if (sJSON === '') {
      sStringJSON = '{}';
    } else {
      sStringJSON = sJSON;
    }

    try {
      JSON.parse(sStringJSON);
    } catch (oError) {
      let sErrorMessage =
        this.m_oTranslate.instant('DIALOG_APPS_INVALID_JSON') +
        '<br>' +
        oError.toString();

      this.m_oNotificationDisplayService.openAlertDialog(
        sErrorMessage,
        '',
        'alert'
      );
    }

    this.m_oProcessorService
      .runProcessor(
        this.m_oSelectedProcessor.processorName,
        sStringJSON,
        this.m_bNotification
      )
      .subscribe((oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          let sNotificationMsg = this.m_oTranslate.instant(
            'MSG_MKT_PROC_SCHEDULED'
          );
          this.m_oNotificationDisplayService.openSnackBar(
            sNotificationMsg,
            '',
            'success-snackbar'
          );
        }
        this.m_oDialogRef.close();
      });
    return true;
  }

  /**
   * Open the help dialog
   */
  openHelp() {
    let sHelpMessage = '';
    this.m_oProcessorService
      .getHelpFromProcessor(this.m_oSelectedProcessor.processorName)
      .subscribe((oResponse) => {
        if (oResponse.stringValue) {
          sHelpMessage = oResponse.stringValue;
          if (sHelpMessage) {
            try {
              let oHelp = JSON.parse(sHelpMessage);

              sHelpMessage = oHelp;
            } catch (oError) {
              sHelpMessage = oResponse.stringValue;
            }
          }
        }
      });
  }

  handleToolbarClick(oEvent, oProcessor) {
    switch (oEvent) {
      case 'params':
        this.selectProcessor(oProcessor);
        this.showParametersLibrary(true);
        break;
      case 'download':
        this.downloadProcessor(oProcessor);
        break;
      case 'edit':
        this.openEditProcessorDialog(oProcessor);
        break;
      default:
        this.removeProcessor(oProcessor);
    }
  }

  handleSearchChange(oEvent) {
    this.m_sSearchString = oEvent.event.target.value;
  }

  getJSONInput(oEvent) {
    this.m_sMyJsonString = this.m_oJsonEditorService.getValue();
  }

  rabbitMessageHook(oRabbitMessage: any, oController: any) {
    console.log('RECEIVED ' + oRabbitMessage);
    oController.getProcessorsList();
  }

  showHelpMessage(bShowMessage: boolean) {
    this.m_bShowHelpMessage = bShowMessage;
  }

  showParametersLibrary(bShowLibrary: boolean) {
    this.m_bShowParamsLibrary = bShowLibrary;
  }

  getParamsTemplate(oEvent) {
    this.m_bShowParamsLibrary = false;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_sMyJsonString = decodeURIComponent(oEvent.jsonParameters);
    }

    //Re-init the JSON editor with time to re-set the DOM
    setTimeout(() => {
      this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
      this.m_oJsonEditorService.initEditor();
      this.m_oJsonEditorService.setText(this.m_sMyJsonString);
    }, 500);
  }

  getExecutePurchase() {
    this.createAppPaymentObject();
    this.m_oNotificationDisplayService
      .openConfirmationDialog(
        this.m_oTranslate.instant('USER_SUBSCRIPTION_STRIPE_MSG'),
        this.m_oTranslate.instant('USER_SUBSCRIPTION_STRIPE_TITLE'),
        'info'
      )
      .subscribe((bDialogResult) => {
        if (bDialogResult) {
          this.saveAndGetStripePaymentUrl();
        }
      });
  }

  createAppPaymentObject() {
    this.m_oAppPaymentVM = {
      paymentName: `${
        this.m_oSelectedProcessor.processorName
      }_${new Date().toISOString()}`,
      processorId: this.m_oSelectedProcessor.processorId,
      buyDate: new Date().toISOString(),
    };
  }

  saveAndGetStripePaymentUrl() {
    this.m_oProcessorService
      .addAppPayment(this.m_oAppPaymentVM)
      .subscribe((oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog(
            this.m_oTranslate.instant('USER_SUBSCRIPTION_STRIPE_FAIL'),
            '',
            'danger'
          );
        } else {
          this.m_oProcessorService
            .getStripeOnDemandPaymentUrl(
              this.m_oAppPaymentVM.processorId,
              oResponse.message
            )
            .subscribe({
              next: (oResponse) => {
                if (
                  !FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.message)
                ) {
                  this.m_oNotificationDisplayService.openSnackBar(
                    this.m_oTranslate.instant('USER_SUBSCRIPTION_URL'),
                    '',
                    'success-snackbar'
                  );

                  let sUrl = oResponse.message;

                  window.open(sUrl, '_blank');
                }
              },
              error: (oError) => {
                this.m_oNotificationDisplayService.openAlertDialog(
                  this.m_oTranslate.instant('USER_SUBSCRIPTION_URL_ERROR'),
                  '',
                  'danger'
                );
              },
            });
        }
      });
  }

  openNotificationHelp() {
    this.m_oNotificationDisplayService.openAlertDialog(
      'WASDI will send you an email notification upon completion of this processor',
      'Info',
      'info'
    );
  }

  /**
   * Close the Apps Dialog
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
