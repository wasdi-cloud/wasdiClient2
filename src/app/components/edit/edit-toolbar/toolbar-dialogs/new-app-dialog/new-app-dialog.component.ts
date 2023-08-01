import { Component, Inject, OnInit } from '@angular/core';
import { faRocket, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { ProductService } from 'src/app/services/api/product.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
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
   * Processor Inputted from opening dialog
   */
  m_oInputProcessor: any = null;

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



  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oFormBuilder: FormBuilder,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oProductService: ProductService,
    private m_oWorkspaceService: WorkspaceService) { }

  ngOnInit(): void {
    //Edit Mode assigned when opening dialog:
    this.m_bEditMode = this.data.editMode;

    //If oProcessor assigned in data, Input Processor = oProcessor:
    if (this.data.inputProcessor && this.m_bEditMode) {
      this.m_oInputProcessor = this.data.inputProcessor;

      //Assign Input data to model: 
      this.m_sName = this.m_oInputProcessor.processorName;
      this.m_sDescription = this.m_oInputProcessor.processorDescription;
      this.m_sJSONSample = decodeURIComponent(this.m_oInputProcessor.paramsSample);
      this.m_sProcessorId = this.m_oInputProcessor.processorId;
      this.m_iMinuteTimeout = this.m_oInputProcessor.minuteTimeout;

      try {
        let oParsed = JSON.parse(this.m_sJSONSample);
        let sPrettyPrint = JSON.stringify(oParsed, null, 2);
        this.m_sJSONSample = sPrettyPrint
      } catch (oError) {
        console.log(oError);
      }

      //Get Marketplace Details: 
      this.getMarketplaceDetails(this.m_sName);
    }
    //Create form builder with nested elements to pass to tabs: 
    this.initializeFormBuilder();
  }

  initializeFormBuilder() {
    this.m_oProcessorForm = this.m_oFormBuilder.group({

      //Nested Form Builder for the PROCESSOR tab:
      processorBasicInfo: this.m_oFormBuilder.group({
        sProcessorName: new FormControl({
          value: this.m_sName,
          disabled: this.m_bEditMode
        }),
        oType: '',
        sShortDescription: this.m_sDescription,
        sJSONSample: this.m_sJSONSample,
        iMinuteTimeout: this.m_iMinuteTimeout,
        bIsPublic: this.m_bPublic,
        oSelectedFile: this.m_oSelectedFile,
        sSelectedFileName: ""
      }),

      //Nested Form Builder for STORE tab: 
      processorStoreInfo: this.m_oFormBuilder.group({
        sFriendlyName: "",
        sLink: "",
        sEmail: "",
        iOnDemandPrice: 0,
        iSubscriptionPrice: 0,
        bShowInStore: false,
        sLongDescription: "",
        aoCategories: []
      })
    });

    if (this.m_oInputProcessor) {
      this.m_oProcessorForm.patchValue({
        processorBasicInfo: {
          oType: this.m_oInputProcessor.type
        }
      });
    }
  }



  getMarketplaceDetails(sProcessorName: string) {
    this.m_oProcessorService.getMarketplaceDetail(sProcessorName).subscribe({
      next: oResponse => {
        //If oResponse is null or undefined 
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          console.log("error in retrieving app details");
        } else {
          //if oResponse vaild, assign response to m_oProcessorDetails
          this.m_oProcessorDetails = oResponse;
          console.log(this.m_oProcessorDetails);
        }
      },
      error: oError => {
        console.log(oError);
      }
    })
  }

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
    if (this.m_bPublic === false) {
      this.m_oInputProcessor.isPublic = 0;
    } else {
      this.m_oInputProcessor.isPublic = 1;
    }
    //Set processor name: 
    this.m_oInputProcessor.processorName = this.m_oProcessorForm.get('processorBasicInfo.sProcessorName').value;

    //Set processor description:
    this.m_oInputProcessor.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Set JSON Parameters: 
    this.m_oInputProcessor.paramsSample = encodeURI(this.m_oProcessorForm.get('processorBasicInfo.sJSONSample').value);

    //Set time out (in minutes): 
    this.m_oInputProcessor.minuteTimeout = this.m_oProcessorForm.get('processorBasicInfo.iMinuteTimeout').value;

    //Copy the brief description also in the detail view: 
    this.m_oProcessorDetails.processorDescription = this.m_oProcessorForm.get('processorBasicInfo.sShortDescription').value;

    //Version is fixed at 1 and hidden from the form - do not set
  }

  updateProcessor() {
    this.setInputProcessorValues();

    console.log(this.m_oProcessorForm);
    console.log(this.m_oInputProcessor);

    console.log(this.m_oProcessorForm)

    //Update the processor and the processor details
    this.m_oProcessorService.updateProcessor(this.m_oInputProcessor.processorId, this.m_oInputProcessor).subscribe({
      next: oResponse => {
        console.log(oResponse);
        this.m_oProcessorService.updateProcessorDetails(this.m_oInputProcessor.processorId, this.m_oInputProcessor).subscribe({
          next: oResponse => {
            console.log(oResponse);
            console.log("processor data updated");
          },
          error: oError => {
            console.log(oError);
          }
        })
      },
      error: oError => {
        console.log(oError);
      }
    });

    // //Check if there was also a file uploaded:
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

    //Check if the UI JSON Param was changed: 
    // if (this.m_bUIChanged) {
    //   this.m_oProcessorService.saveProcessorUI(this.m_oInputProcessor.processorName, this.m_sProcessorUI).subscribe({
    //     next: oResponse => {
    //       console.log(oResponse); 
    //     },
    //     error: oError => {
    //       console.log(oError);
    //     }
    //   })
    // }

  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
