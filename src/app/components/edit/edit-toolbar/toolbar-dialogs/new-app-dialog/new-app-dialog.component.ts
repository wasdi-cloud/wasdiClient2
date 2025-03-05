import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { JsonEditorService } from 'src/app/services/json-editor.service';

//Angular Materials Imports:
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Model Imports:
import { Workspace } from 'src/app/shared/models/workspace.model';

//Fadeout Utilities Import:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ImageService } from 'src/app/services/api/image.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css'],
})
export class NewAppDialogComponent implements OnInit {
  /**
   * Edit Mode boolean: are we creating a new processor or editing an existing one?
   */
  m_bEditMode: boolean = false;

  /**
   * UI Changed boolean: was the UI JSON changed in the UI tab?
   */
  m_bUIChanged: boolean;

  /**
   * Processor UI string: retrieved from UI tab
   */
  m_sProcessorUI: string;

  /**
   * Active Workspace
   */
  m_oActiveWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();

  /**
   * Selected File for the drag drop input
   */
  m_oFile: any = null;

  /**
   * Creation for new form builder
   */
  m_oProcessorForm: any;

  /**
   * Active Tab - default to "PROCESSOR"
   */
  m_sActiveTab = 'PROCESSOR';

  /**
   * Processor Name
   */
  m_sName: string = '';

  /**
   * Processor Description
   */
  m_sDescription: string = '';

  /**
   * Processor Version
   */
  m_sVersion: string = '1';

  /**
   * Input Processor JSON Parameters Sample
   */
  m_sJSONSample: string = '{}';

  /**
   * Input Processor Processor Id
   */
  m_sProcessorId: string = '';

  /**
   * Name of the Type  of a processor in edit mode
   * @type {string}
   */
  m_sTypeNameOnly: string = '';

  /**
   * Id of the Type  of a processor in edit mode
   * @type {string}
   */
  m_sTypeIdOnly = '';

  /**
   * Public flag
   * @type {boolean}
   */
  m_bPublic = true;

  /**
   * Time Out in Minutes
   * @type {number}
   */
  m_iMinuteTimeout = 180;

  /**
   * Selected File (.zip file for processor)
   */
  m_oSelectedFile: null;

  /**
   * Flag to check if the processor was updated
   */
  m_bIsUpdated: boolean = false;

  /**
   * Processor Inputted from opening dialog
   */
  m_oInputProcessor: {
    deploymentOngoing: boolean;
    imgLink: string;
    isPublic: any;
    minuteTimeout: number;
    paramsSample: string;
    processorDescription: string;
    processorId: string;
    processorName: string;
    processorVersion: string;
    publisher: string;
    readOnly: boolean;
    sharedWithMe: boolean;
    type: string;
  } = {
    deploymentOngoing: false,
    imgLink: '',
    isPublic: 0,
    minuteTimeout: 180,
    paramsSample: '',
    processorDescription: '',
    processorId: '',
    processorName: '',
    processorVersion: '1',
    publisher: '',
    readOnly: false,
    sharedWithMe: false,
    type: '',
  };
  /**
   * View Model with the Processor Detailed Info.
   * Is fetched and saved with different APIs
   * @type {{processorDescription: string, updateDate: number, images: [], imgLink: string, ondemandPrice: number, link: string, score: number, processorId: string, publisher: string, buyed: boolean, processorName: string, categories: [], isMine: boolean, friendlyName: string, email: string, subscriptionPrice: number}}
   */
  m_oProcessorDetails = {
    processorId: '',
    processorName: '',
    processorDescription: '',
    imgLink: '',
    publisher: '',
    score: 0.0,
    friendlyName: '',
    link: '',
    email: '',
    ondemandPrice: 0.0,
    subscriptionPrice: 0.0,
    updateDate: 0,
    categories: [],
    images: [],
    isMine: true,
    buyed: false,
    longDescription: '',
    showInStore: false,
    maxImages: 6,
    reviewsCount: 0,
    squareKilometerPrice: 0,
    areaParameterName: "",
    purchased: 0, // NOTE: at the moment here is the count of run on the main server
    totalRuns: 0, // NOTE: not set at the moment
    userRuns: 0, // NOTE: not set at the moment
  };

  m_bDeploymentOngoing: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oFormBuilder: FormBuilder,
    private m_oImageService: ImageService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit(): void {
    //Edit Mode assigned when opening dialog:
    this.m_bEditMode = this.data.editMode;
    //If oProcessor assigned in data, Input Processor = oProcessor:
    if (this.data.inputProcessor && this.m_bEditMode) {
      // this.m_oInputProcessor = this.data.inputProcessor;
      this.initializeProcessorInformation(this.data.inputProcessor.processorId);
    } else {
      this.initializeFormBuilder();
    }
  }

  /**
   * Initialize the processor information
   * @param sProcessorId
   */
  private initializeProcessorInformation(sProcessorId: string): void {
    let sErrorMsg: string = this.m_oTranslate.instant(
      'DIALOG_PROCESSOR_FETCH_ERROR'
    );
    //Base Input
    this.m_oProcessorService.getDeployedProcessor(sProcessorId).subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog(
            sErrorMsg,
            '',
            'danger'
          );
        } else {
          this.m_oInputProcessor = oResponse;
          this.m_bDeploymentOngoing = oResponse.deploymentOngoing;

          //Marketplace Details
          this.m_oProcessorService
            .getMarketplaceDetail(this.m_oInputProcessor.processorName)
            .subscribe({
              next: (oResponse) => {
                if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
                  this.m_oNotificationDisplayService.openAlertDialog(
                    sErrorMsg,
                    '',
                    'danger'
                  );
                } else {
                  this.m_oProcessorDetails = oResponse;

                  this.m_sName = this.m_oInputProcessor.processorName;
                  this.m_sDescription = this.m_oInputProcessor.processorDescription;
                  this.m_sJSONSample = decodeURIComponent(this.m_oInputProcessor.paramsSample);
                  this.m_sProcessorId = this.m_oInputProcessor.processorId;
                  this.m_iMinuteTimeout = this.m_oInputProcessor.minuteTimeout;
                  this.m_sTypeIdOnly = this.m_oInputProcessor.type;

                  try {
                    let oParsed = JSON.parse(this.m_sJSONSample);
                    let sPrettyPrint = JSON.stringify(oParsed, null, 2);
                    this.m_sJSONSample = sPrettyPrint;
                  } catch (oError) {
                    console.log(oError);
                  }

                  this.initializeFormBuilder();
                  this.getProcessorUI(this.m_sName);
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
   * Initialize the form builder with nested form groups for Processor Base Content and Store tabs
   */
  private initializeFormBuilder() {
    this.m_oProcessorForm = this.m_oFormBuilder.group({
      //Nested Form Builder for the PROCESSOR tab:
      processorBasicInfo: this.m_oFormBuilder.group({
        sProcessorName: new FormControl({
          value: this.m_sName,
          disabled: this.m_bEditMode,
        }),
        oType: {
          value: this.m_oInputProcessor.type,
          disabled: this.m_bEditMode,
        },
        sShortDescription: this.m_oInputProcessor.processorDescription,
        sJSONSample: this.m_sJSONSample,
        iMinuteTimeout: this.m_iMinuteTimeout,
        bIsPublic: this.m_oInputProcessor.isPublic,
        oSelectedFile: this.m_oSelectedFile,
        sSelectedFileName: '',
        sProcessorVersion: this.m_oInputProcessor.processorVersion
      }),

      //Nested Form Builder for STORE tab:
      processorStoreInfo: this.m_oFormBuilder.group({
        sFriendlyName: this.m_oProcessorDetails.friendlyName,
        sLink: this.m_oProcessorDetails.link,
        sEmail: this.m_oProcessorDetails.email,
        iOnDemandPrice: this.m_oProcessorDetails.ondemandPrice,
        iSubscriptionPrice: this.m_oProcessorDetails.subscriptionPrice,
        bShowInStore: this.m_oProcessorDetails.showInStore,
        sLongDescription: this.m_oProcessorDetails.longDescription,
        sAreaParameterName: this.m_oProcessorDetails.areaParameterName,
        iPricePerSquareKm: this.m_oProcessorDetails.squareKilometerPrice,
        aoCategories: [this.m_oProcessorDetails.categories],
      }),

      //Nested Form Builder for UI tab:
      processorUIInfo: this.m_oFormBuilder.group({
        sProcessorUI: '{\n"tabs": []\n}',
        bUIChanged: false,
      }),
    });
  }

  /**
   * Get Marketplace details - set m_oProcessorDetails view model and execute form builder initialization
   * @param sProcessorName
   */
  private getMarketplaceDetails(sProcessorName: string) {
    let sErrorMsg = this.m_oTranslate.instant(
      'DIALOG_PROCESSOR_APP_DETAILS_ERROR'
    );
    this.m_oProcessorService.getMarketplaceDetail(sProcessorName).subscribe({
      next: (oResponse) => {
        //If oResponse is null or undefined
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog(
            sErrorMsg,
            '',
            'danger'
          );
        } else {
          //if oResponse valid, assign response to m_oProcessorDetails
          this.m_oProcessorDetails = oResponse;
          this.initializeFormBuilder();
          this.m_oImageService.updateProcessorLogoImageUrl(
            this.m_oProcessorDetails
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
   * Retrieve the processor UI from the server and patch its value in the Processor Form
   * @param sProcessorName
   */
  private getProcessorUI(sProcessorName: string): void {
    let sErrorMsg: string = this.m_oTranslate.instant(
      'DIALOG_PROCESSOR_APP_UI_ERROR'
    );
    this.m_oProcessorService.getProcessorUI(sProcessorName).subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_sProcessorUI = JSON.stringify(oResponse, undefined, 4);
          this.m_oProcessorForm.patchValue({
            processorUIInfo: {
              sProcessorUI: this.m_sProcessorUI,
            },
          });
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
   * Change active tab on user interaction
   * @param sTabName
   */
  public changeActiveTab(sTabName: string): void {
    if (sTabName) {
      this.m_sActiveTab = sTabName;
    }
  }

  /**
   * Function to set the input processor values
   */
  private setInputProcessorValues(): void {
    //Is processor public?
    if (!this.m_oProcessorForm.get('processorBasicInfo.bIsPublic').value) {
      this.m_oInputProcessor.isPublic = 0;
    }
    else {
      if (this.m_oProcessorForm.get('processorBasicInfo.bIsPublic').value === false) {
        this.m_oInputProcessor.isPublic = 0;
      }
      else {
        this.m_oInputProcessor.isPublic = 1;
      }
    }

    //Set processor name:
    this.m_oInputProcessor.processorName = this.m_oProcessorForm.get('processorBasicInfo.sProcessorName').value;

    //Set processor description:
    this.m_oInputProcessor.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Set JSON Parameters:
    if (this.m_oProcessorForm.get('processorBasicInfo.sJSONSample').value) {
      let sUpdatedText = this.m_oProcessorForm.get('processorBasicInfo.sJSONSample').value;
      this.m_oInputProcessor.paramsSample = encodeURI(sUpdatedText);
    }

    //Set time out (in minutes):
    this.m_oInputProcessor.minuteTimeout = this.m_oProcessorForm.get('processorBasicInfo.iMinuteTimeout').value;

    //Copy the brief description also in the detail view:
    this.m_oProcessorDetails.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Version is fixed at 1 and hidden from the form - do not set

    //Set processor details:
    this.m_oProcessorDetails.friendlyName = this.m_oProcessorForm.get('processorStoreInfo.sFriendlyName').value;

    // Read the link
    this.m_oProcessorDetails.link = this.m_oProcessorForm.get('processorStoreInfo.sLink').value;

    // Read the email
    this.m_oProcessorDetails.email = this.m_oProcessorForm.get('processorStoreInfo.sEmail').value;

    // On demand price
    this.m_oProcessorDetails.ondemandPrice = this.m_oProcessorForm.get('processorStoreInfo.iOnDemandPrice').value;

    // Show in store flag
    this.m_oProcessorDetails.showInStore = this.m_oProcessorForm.get('processorStoreInfo.bShowInStore').value;

    // Long description
    this.m_oProcessorDetails.longDescription = this.m_oProcessorForm.get('processorStoreInfo.sLongDescription').value;
  }

  /**
   * Function to handle getting and checking JSON input from UI tab:
   * @param sProcessorUI
   * @returns {boolean | any}
   */
  private checkUIInput(sProcessorUI: string): any {
    try {
      let oParsedJSONObject = JSON.parse(sProcessorUI);
      if (oParsedJSONObject && typeof oParsedJSONObject === 'object') {
        return oParsedJSONObject;
      }
    } catch (error) {
      this.m_oNotificationDisplayService.openAlertDialog(
        this.m_oTranslate.instant('DIALOG_PARSE_JSON_ERROR')
      );
    }
  }

  /**
   * Update an existing Processor on the server
   */
  public updateProcessor(): void {
    this.setInputProcessorValues();

    let sMessage = 'Processor Data Updated';

    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(
        this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value
      ) === false
    ) {
      sMessage += '<BR>';
      sMessage += 'Updating Processor Files';
      sMessage += '<BR>';
      sMessage += 'Rebuild Ongoing';
    }

    // Update the processor and the processor details
    this.m_oProcessorService
      .updateProcessor(this.m_oInputProcessor.processorId,this.m_oInputProcessor).subscribe({
        next: (oResponse) => {
          this.m_oProcessorService
            .updateProcessorDetails(
              this.m_oInputProcessor.processorId,
              this.m_oProcessorDetails
            )
            .subscribe({
              next: (oResponse) => {
                this.m_oNotificationDisplayService.openSnackBar(sMessage);
                this.m_bIsUpdated = true;
                this.onDismiss();
              },
              error: (oError) => {
                this.m_oNotificationDisplayService.openAlertDialog(
                  `Error in updating ${this.m_oInputProcessor.processorName}`
                );
              },
            });
        },
        error: (oError) => {
          this.m_oNotificationDisplayService.openAlertDialog(
            `Error in updating ${this.m_oInputProcessor.processorName}`
          );
        },
      });

    //Check if there was also a file uploaded:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value) === false) {
      let oSelectedFile = this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value;

      let sFileName = this.m_oProcessorForm.get('processorBasicInfo.sSelectedFileName').value;

      this.m_oProcessorService.updateProcessorFiles(
          sFileName,
          this.m_oInputProcessor.processorId,
          oSelectedFile
        ).subscribe({
          next: (oResponse) => {
            this.m_bDeploymentOngoing = true;
          },
          error: (oError) => {
            this.m_oNotificationDisplayService.openAlertDialog(
              `Error in updating ${this.m_oInputProcessor.processorName} files !!!`
            );
            this.m_bDeploymentOngoing = false;
          },
        });
    }

    //Update the APP UI JSON
    this.addAppJSON(false);
  }

  /**
   * Deploy a New Processor to the server
   */
  public postNewProcessor(): boolean {
    if (
      FadeoutUtils.utilsIsObjectNullOrUndefined(
        this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value
      ) === true
    ) {
      this.m_oNotificationDisplayService.openAlertDialog(
        'Please add a .zip file containing your processor'
      );
      return false;
    }

    this.setInputProcessorValues();
    let sType = this.m_oProcessorForm.get('processorBasicInfo.oType').value.id;

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sType)) {
      this.m_oNotificationDisplayService.openAlertDialog(
        'Please select a processor type'
      );
      return false;
    }

    this.m_oInputProcessor.processorName =
      this.m_oInputProcessor.processorName.toLowerCase();

    let oSelectedFile = this.m_oProcessorForm.get(
      'processorBasicInfo.oSelectedFile'
    ).value;
    let sFileName = this.m_oProcessorForm.get(
      'processorBasicInfo.sSelectedFileName'
    ).value;

    this.m_oProcessorService
      .uploadProcessor(
        this.m_oActiveWorkspace.workspaceId,
        this.m_oInputProcessor.processorName,
        this.m_oInputProcessor.processorVersion,
        this.m_oInputProcessor.processorDescription,
        sType,
        this.m_oInputProcessor.paramsSample,
        this.m_oInputProcessor.isPublic,
        oSelectedFile
      )
      .subscribe({
        next: (oResponse) => {
          let bOk = false;

          if (oResponse != null) {
            bOk = oResponse.boolValue;
          }

          if (bOk) {
            this.m_oNotificationDisplayService.openSnackBar(
              `Deployment of ${this.m_oInputProcessor.processorName} has started`
            );
            //App has been created - therefore also upload the APP UI JSON
            this.addAppJSON(true);
            this.onDismiss(true);
          } else {
            this.m_oNotificationDisplayService.openAlertDialog(
              `Error: ${oResponse.stringValue}`
            );
          }
        },
        error: (oError) => {
          this.m_oNotificationDisplayService.openAlertDialog(
            `Error in deploying ${this.m_oInputProcessor.processorName}`
          );
        },
      });

    return true;
  }

  /**
   * Add App UI JSON to an uploaded or updated app
   * @param boolean
   */
  private addAppJSON(bIsUploading: boolean): void {
    if (
      this.checkUIInput(
        this.m_oProcessorForm.get('processorUIInfo.sProcessorUI').value
      )
    ) {
      this.m_sProcessorUI = this.checkUIInput(
        this.m_oProcessorForm.get('processorUIInfo.sProcessorUI').value
      );

      //If parse JSON is successful -> update the processor UI
      this.m_oProcessorService
        .saveProcessorUI(
          this.m_oInputProcessor.processorName,
          this.m_sProcessorUI
        )
        .subscribe({
          next: (oResponse) => {
            if (bIsUploading) {
              //if creating a new processor, show uploaded success
              this.m_oNotificationDisplayService.openSnackBar(
                'JSON Uploaded',
                '',
                'success-snackbar'
              );
            } else {
              //if updating, show update success
              this.m_oNotificationDisplayService.openSnackBar(
                'JSON Updated',
                '',
                'success-snackbar'
              );
            }
          },
          error: (oError) => {
            this.m_oNotificationDisplayService.openAlertDialog(
              oError,
              '',
              'danger'
            );
          },
        });
    }
  }

  /**
   * Close the dialog
   */
  public onDismiss(bIsChanged?: boolean): void {
    let bChanged;
    let oChanged = {};
    if (bIsChanged) {
      bChanged = bIsChanged;
    } else {
      bChanged = this.m_bIsUpdated;
      oChanged = {
        changed: bChanged,
        json: this.m_oInputProcessor.paramsSample,
      };
    }
    this.m_oDialogRef.close(oChanged);
  }
}
