import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';


//Font Awesome Icon Imports:
import { faRocket, faXmark } from '@fortawesome/free-solid-svg-icons';

//Angular Materials Imports:
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Model Imports:
import { Workspace } from 'src/app/shared/models/workspace.model';

//Fadeout Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ImageService } from 'src/app/services/api/image.service';

@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css']
})
export class NewAppDialogComponent implements OnInit {
  //Font Awesome Imports
  faRocket = faRocket;
  faX = faXmark;

  /**
   * Edit Mode boolean: are we creating a new processor or editing an existing one?
   */
  m_bEditMode: boolean;

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
  m_oFile: any = null;

  /**
   * Creation for new form builder
   */
  m_oProcessorForm: any;

  /**
   * Active Tab - default to "PROCESSOR"
   */
  m_sActiveTab = "PROCESSOR";

  /**
   * Processor Name
   */
  m_sName: string = "";

  /**
   * Processor Description
   */
  m_sDescription: string = "";

  /**
   * Processor Version
   */
  m_sVersion: string = "1";

  /**
   * Input Processor JSON Parameters Sample
   */
  m_sJSONSample: string = "";

  /**
   * Input Processor Processor Id
   */
  m_sProcessorId: string = "";

  /**
   * Name of the Type  of a processor in edit mode
   * @type {string}
   */
  m_sTypeNameOnly: string = "";

  /**
   * Id of the Type  of a processor in edit mode
   * @type {string}
   */
  m_sTypeIdOnly = "";

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
  * Processor Inputted from opening dialog
  */
  m_oInputProcessor: {
    imgLink: string,
    isPublic: any,
    minuteTimeout: number,
    paramsSample: string,
    processorDescription: string,
    processorId: string,
    processorName: string,
    processorVersion: string,
    publisher: string,
    readOnly: boolean,
    sharedWithMe: boolean,
    type: string
  } = {
      imgLink: "",
      isPublic: 0,
      minuteTimeout: 180,
      paramsSample: "",
      processorDescription: "",
      processorId: "",
      processorName: "",
      processorVersion: "1",
      publisher: "",
      readOnly: false,
      sharedWithMe: false,
      type: ""
    };
  /**
  * View Model with the Processor Detailed Info.
  * Is fetched and saved with different APIs
  * @type {{processorDescription: string, updateDate: number, images: [], imgLink: string, ondemandPrice: number, link: string, score: number, processorId: string, publisher: string, buyed: boolean, processorName: string, categories: [], isMine: boolean, friendlyName: string, email: string, subscriptionPrice: number}}
  */
  m_oProcessorDetails = {
    processorId: "",
    processorName: "",
    processorDescription: "",
    imgLink: "",
    publisher: "",
    score: 0.0,
    friendlyName: "",
    link: "",
    email: "",
    ondemandPrice: 0.0,
    subscriptionPrice: 0.0,
    updateDate: 0,
    categories: [],
    images: [],
    isMine: true,
    buyed: false,
    longDescription: "",
    showInStore: false,
    maxImages: 6,
    reviewsCount: 0,
    purchased: 0, // NOTE: at the moment here is the count of run on the main server
    totalRuns: 0, // NOTE: not set at the moment
    userRuns: 0, // NOTE: not set at the moment
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oFormBuilder: FormBuilder,
    private m_oImageService: ImageService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService) { }

  ngOnInit(): void {
    //Edit Mode assigned when opening dialog:
    this.m_bEditMode = this.data.editMode;
    //If oProcessor assigned in data, Input Processor = oProcessor:
    if (this.data.inputProcessor && this.m_bEditMode) {
      // this.m_oInputProcessor = this.data.inputProcessor;
      this.initializeProcessorInformation(this.data.inputProcessor.processorId);

    } else {
      //Create form builder with nested elements to pass to tabs: 
      this.initializeFormBuilder();
    }
  }

  initializeProcessorInformation(sProcessorId: string) {
    //Base Input 
    this.m_oProcessorService.getDeployedProcessor(sProcessorId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Unable to get Processor Information.")
        } else {
          this.m_oInputProcessor = oResponse;
          //Marketplace Details
          this.m_oProcessorService.getMarketplaceDetail(this.m_oInputProcessor.processorName).subscribe({
            next: oResponse => {
              if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
                this.m_oNotificationDisplayService.openAlertDialog("Unable to get Processor Information")
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
                  this.m_sJSONSample = sPrettyPrint
                } catch (oError) {
                  console.log(oError);
                }

                this.initializeFormBuilder();
                this.getProcessorUI(this.m_sName);
              }
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Unable to get Processor Information")
            }
          })
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Unable to get Processor Information.")
      }
    })

  }
  /**
   * Initalize the form builder with nested form groups for Processor Base Content and Store tabs
   */
  initializeFormBuilder() {
    this.m_oProcessorForm = this.m_oFormBuilder.group({

      //Nested Form Builder for the PROCESSOR tab:
      processorBasicInfo: this.m_oFormBuilder.group({
        sProcessorName: new FormControl({
          value: this.m_sName,
          disabled: this.m_bEditMode
        }),
        oType: {
          value: this.m_oInputProcessor.type,
          disabled: this.m_bEditMode
        },
        sShortDescription: this.m_oInputProcessor.processorDescription,
        sJSONSample: this.m_sJSONSample,
        iMinuteTimeout: this.m_iMinuteTimeout,
        bIsPublic: this.m_oInputProcessor.isPublic,
        oSelectedFile: this.m_oSelectedFile,
        sSelectedFileName: ""
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
        aoCategories: [this.m_oProcessorDetails.categories]
      }),

      //Nested Form Builder for UI tab: 
      processorUIInfo: this.m_oFormBuilder.group({
        sProcessorUI: "",
        bUIChanged: false
      })
    });

  }

  /**
   * Get Marketplace details - set m_oProcessorDetails view model and execute form builder initalization
   * @param sProcessorName 
   */
  getMarketplaceDetails(sProcessorName: string) {
    this.m_oProcessorService.getMarketplaceDetail(sProcessorName).subscribe({
      next: oResponse => {
        //If oResponse is null or undefined 
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oNotificationDisplayService.openAlertDialog("Error in fetching the application details");
        } else {
          //if oResponse vaild, assign response to m_oProcessorDetails
          this.m_oProcessorDetails = oResponse;
          this.initializeFormBuilder();
          this.m_oImageService.updateProcessorLogoImageUrl(this.m_oProcessorDetails);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in fetching the application details");
      }
    })
  }

  getProcessorUI(sProcessorName: string) {
    this.m_oProcessorService.getProcessorUI(sProcessorName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_sProcessorUI = JSON.stringify(oResponse, undefined, 4);
          this.m_oProcessorForm.patchValue({
            processorUIInfo: {
              sProcessorUI: this.m_sProcessorUI
            }
          })
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error getting the processor UI");
      }
    })
  }

  /**
   * Change active tab on user interaction
   * @param sTabName 
   */
  changeActiveTab(sTabName: string) {
    if (sTabName) {
      this.m_sActiveTab = sTabName;
    }
  }

  /**
   * Function to set the input processor values
   */
  setInputProcessorValues() {
    //Is processor public? 
    if (this.m_oProcessorForm.get('processorBasicInfo.bIsPublic').value === false) {
      this.m_oInputProcessor.isPublic = 0;
    } else {
      this.m_oInputProcessor.isPublic = 1;
    }
    //Set processor name: 
    this.m_oInputProcessor.processorName = this.m_oProcessorForm.get('processorBasicInfo.sProcessorName').value;

    //Set processor description:
    this.m_oInputProcessor.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Set JSON Parameters: 
    if (this.m_oProcessorForm.get('processorBasicInfo.sJSONSample').value) {
      this.m_oInputProcessor.paramsSample = encodeURI(this.m_oProcessorForm.get('processorBasicInfo.sJSONSample').value);
    }

    //Set time out (in minutes): 
    this.m_oInputProcessor.minuteTimeout = this.m_oProcessorForm.get('processorBasicInfo.iMinuteTimeout').value;

    //Copy the brief description also in the detail view: 
    this.m_oProcessorDetails.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Version is fixed at 1 and hidden from the form - do not set

    //Set processor details: 
    this.m_oProcessorDetails.friendlyName = this.m_oProcessorForm.get('processorStoreInfo.sFriendlyName').value;
    this.m_oProcessorDetails.link = this.m_oProcessorForm.get('processorStoreInfo.sLink').value;
    this.m_oProcessorDetails.email = this.m_oProcessorForm.get('processorStoreInfo.sEmail').value;
    this.m_oProcessorDetails.ondemandPrice = this.m_oProcessorForm.get('processorStoreInfo.iOnDemandPrice').value;
    this.m_oProcessorDetails.showInStore = this.m_oProcessorForm.get('processorStoreInfo.bShowInStore').value;
    this.m_oProcessorDetails.longDescription = this.m_oProcessorForm.get('processorStoreInfo.sLongDescription').value;
  }

  /**
   * Function to handle getting and checking JSON input from UI tab:
   * @param sProcessorUI
   * @returns {boolean | any}
   */
  checkUIInput(sProcessorUI: string) {
    try {
      let oParsedJSONObject = JSON.parse(sProcessorUI);
      if (oParsedJSONObject && typeof oParsedJSONObject === "object") {
        return oParsedJSONObject;
      }

    } catch (error) {
      this.m_oNotificationDisplayService.openAlertDialog("There was an error in parsing the JSON");
    }
  }

  /**
   * Update an Existing Processor
   */
  updateProcessor() {
    this.setInputProcessorValues();
    // Update the processor and the processor details
    this.m_oProcessorService.updateProcessor(this.m_oInputProcessor.processorId, this.m_oInputProcessor).subscribe({
      next: oResponse => {
        this.m_oProcessorService.updateProcessorDetails(this.m_oInputProcessor.processorId, this.m_oProcessorDetails).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar("Processor Data Updated<br>Rebuild ongoing", "Close", "right", "bottom");
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(`Error in updating ${this.m_oInputProcessor.processorName}`);
          }
        })
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(`Error in updating ${this.m_oInputProcessor.processorName}`);
      }
    });

    //Check if there was also a file uploaded:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value) === false) {
      let oSelectedFile = this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value
      let sFileName = this.m_oProcessorForm.get('processorBasicInfo.sSelectedFileName').value

      this.m_oProcessorService.updateProcessorFiles(sFileName, this.m_oInputProcessor.processorId, oSelectedFile).subscribe({
        next: oResponse => {
          console.log(oResponse)
        },
        error: oError => {
          console.log(oError)
        }
      })
    }

    // Check if the UI JSON Param was changed: 

    // If user has interacted with the Processor UI Textarea:
    if (this.m_oProcessorForm.get('processorUIInfo.sProcessorUI').touched === true) {
      //Try parse JSON on UI Input
      if (this.checkUIInput(this.m_oProcessorForm.get('processorUIInfo.sProcessorUI').value)) {
        this.m_sProcessorUI = this.checkUIInput(this.m_oProcessorForm.get('processorUIInfo.sProcessorUI').value);

        //If parse JSON is successful -> update the processor UI
        this.m_oProcessorService.saveProcessorUI(this.m_oInputProcessor.processorName, this.m_sProcessorUI).subscribe({
          next: oResponse => {
            console.log("JSON Updated")
          },
          error: oError => {
            console.log(oError);
          }
        })
      }

    }
  }

  /**
   * Deploy a New Processor
   */
  postNewProcessor() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value) === true) {
      this.m_oNotificationDisplayService.openAlertDialog("Please add a .zip file containing your processor");
      return false;
    }

    this.setInputProcessorValues();
    let sType = this.m_oProcessorForm.get('processorBasicInfo.oType').value;


    if (FadeoutUtils.utilsIsStrNullOrEmpty(sType)) {
      this.m_oNotificationDisplayService.openAlertDialog("Please select a processor type");
      return false;
    }

    this.m_oInputProcessor.processorName = this.m_oInputProcessor.processorName.toLowerCase();

    let oSelectedFile = this.m_oProcessorForm.get('processorBasicInfo.oSelectedFile').value
    let sFileName = this.m_oProcessorForm.get('processorBasicInfo.sSelectedFileName').value

    this.m_oProcessorService.uploadProcessor(
      this.m_oActiveWorkspace.workspaceId,
      this.m_oInputProcessor.processorName,
      this.m_oInputProcessor.processorVersion,
      this.m_oInputProcessor.processorDescription,
      sType,
      this.m_oInputProcessor.paramsSample,
      this.m_oInputProcessor.isPublic,
      oSelectedFile).subscribe({
        next: oResponse => {

          let bOk = false;

          if (oResponse != null) {
            bOk = oResponse.boolValue
          }

          if (bOk) {
            this.m_oNotificationDisplayService.openSnackBar(`Deployment of ${this.m_oInputProcessor.processorName} has started`, "Close");
          }
          else {
            this.m_oNotificationDisplayService.openSnackBar(`Error: ${oResponse.stringValue} `, "Close");
          }
          this.onDismiss();
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(`Error in deploying ${this.m_oInputProcessor.processorName}`);
        }
      })

    return true;

  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
