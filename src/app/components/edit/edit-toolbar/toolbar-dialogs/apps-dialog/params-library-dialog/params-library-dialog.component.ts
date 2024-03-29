import { Component, Inject } from '@angular/core';

//Angular Materials Imports:
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

//Icon Imports:
import { faBook, faPlus, faShareNodes, faUpload, faX } from '@fortawesome/free-solid-svg-icons';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';

//Component Imports: 
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
  selector: 'app-params-library-dialog',
  templateUrl: './params-library-dialog.component.html',
  styleUrls: ['./params-library-dialog.component.css']
})
export class ParamsLibraryDialogComponent {
  //Font Awesome Icons: 
  faBook = faBook;
  faShare = faShareNodes;
  faUpload = faUpload;
  faX = faX;
  faPlus = faPlus;

  /**
  * Processor View Model Template: this is the processor that we are using to add/edit/remove Parameter Templates
  */
  m_oSelectedProcessor: any;

  /**
  * Active User Id
  */  
  m_sActiveUserId: string = "";
  
  /**
   * Text filter the filter templates in the list
   */
  m_sSearchString: string = "";

  /**
   * List of the Parameter Template light View Models.
   * Here there an entry for each parameter template of this processor
   */
  m_aoParametersTemplateList: any = [];

  /**
   * Loading flag
   */
  m_bIsLoading: boolean = false;

  /**
   * Editing mode flag
   */
  m_bEditMode: boolean = false;

  /**
   * Actually selected Template.
   * Can be one one in edit or a new one
   */
  m_oSelectedTemplate: any = {} as {
    creationDate: string;
    description: string;
    jsonParameters: string;
    name: string;
    processorId: string;
    templateId: string;
    updateDate: string;
    userId: string;
  };

  m_sParametersString: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ParamsLibraryDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
  ) {

    // Save the reference to the processor
    this.m_oSelectedProcessor = data;

    // And the active user id
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();

    // Read the list of processor templates
    this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);

    // Initialize the description
    if (this.m_oSelectedTemplate.description === undefined) {
      this.m_oSelectedTemplate.description = "";
    }

    // Initialize the parameter string
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_sParametersString)) {
      this.m_sParametersString = "{}";
    }
  }

  /**
     * Get the list of processor parameters templates for the current user and the current processor.
     * @param sProcessorId
     * @returns {boolean}
     */
  getProcessorParametersTemplateList(sProcessorId: string) {

    // We need a processor!!
    if (!sProcessorId) {
      return false;
    }

    // We are loading from API
    this.m_bIsLoading = true;

    // Load the list from API
    this.m_oProcessorParametersTemplateService.getProcessorParametersTemplatesListByProcessor(sProcessorId).subscribe(oResponse => {
      // Clean load flag
      this.m_bIsLoading=false;
      if (oResponse) {

        // Clean all the selected flag
        this.cleanTemplateListSelectedStatus(oResponse);
        // Update the list
        this.m_aoParametersTemplateList = oResponse;
      }
    })
    return true;
  }

  /**
   * Clean the selected flag in all elements
   * @param aoList List of Paramenter Template Light View Models
   */
  cleanTemplateListSelectedStatus(aoList) {
    for (let iTemplates=0; iTemplates<aoList.length; iTemplates++){
      aoList[iTemplates].selected = false;
    }
  }

  /**
   * Closes this dialog and applies this parameter template in the Apps dialog
   * @param sTemplateId 
   * @returns 
   */
  applyProcessorParams(sTemplateId: string) {
    if (!sTemplateId) {
      return false;
    }

    this.m_oProcessorParametersTemplateService.getProcessorParametersTemplate(sTemplateId).subscribe(oResponse => {
      if (oResponse) {
        let oTemplate = oResponse;
        this.m_oDialogRef.close(oTemplate)
      }
    })
    return true;
  }

  /**
   * View a selected Paramter Template
   * @param oTemplate 
   */
  viewProcessorParams(oTemplate: any) {

    if (oTemplate) {
      // We clean the selected flag
      this.cleanTemplateListSelectedStatus(this.m_aoParametersTemplateList);
      // And set this as selected
      oTemplate.selected = true;

      // Then we try to read the full view model
      this.m_oProcessorParametersTemplateService.getProcessorParametersTemplate(oTemplate.templateId).subscribe(oResponse => {
        if (oResponse) {
          // Ok take the result
          this.m_oSelectedTemplate = oResponse;
          // Save the JSON Parameters, decoded
          this.m_oSelectedTemplate.jsonParameters = decodeURIComponent(this.m_oSelectedTemplate.jsonParameters)
          this.m_sParametersString = this.m_oSelectedTemplate.jsonParameters;
          // View is not edit!
          this.m_bEditMode = false;
        }
      });
    }
  }

  /**
   * Edit a Parameter Template
   * @param oTemplate 
   * @returns 
   */
  editProcessorParametersTemplate(oTemplate) {
    if (!this.m_oSelectedTemplate) {
      return false;
    }

    try {
      // We just need to pretty print
      let oParsed = JSON.parse(this.m_oSelectedTemplate.jsonParameters);
      let sPrettyPrint = JSON.stringify(oParsed, null, 2);
      this.m_sParametersString = sPrettyPrint;
      // And go in edit mode
      this.m_bEditMode = true;
    } 
    catch (error) {
      this.m_oNotificationDisplayService.openSnackBar("There may be some problem in the JSON of this template", "Close", "right", "bottom");
    }

    return true;
  }

  /**
   * Delete a Processor Parameter
   * @param oTemplate 
   * @returns 
   */
  deleteProcessorParams(oTemplate: any) {
    if (!oTemplate) {
      return false;
    }

    let sConfirmOwner = `Are you sure you want to delete ${oTemplate.name}?`;
    let sConfirmShared = `Are you sure you want to remove your permissions from ${oTemplate.name}`;

    let bConfirmResult: any;

    if (oTemplate.sharedWithMe) {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmShared);
    } else {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmOwner);
    }

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oProcessorParametersTemplateService.deleteProcessorParameterTemplate(oTemplate.templateId).subscribe({
          next: oResponse => {
            this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
            this.m_bEditMode = false;
            this.m_oSelectedTemplate = null;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(`Error in deleting ${oTemplate.name}`)
            this.m_bEditMode = false;
          }
        });
      }
    })
    return true;
  }

  /**
   * Save a processor Parameter Template
   * @returns 
   */
  saveProcessorParam() {
    try {
      // Re-read and try the JSON
      let sJSONPayload = this.m_sParametersString;
      JSON.parse(sJSONPayload);
    } 
    catch (error) {
      this.m_oNotificationDisplayService.openSnackBar("Error in parsing the JSON payload", "Close", "right", "bottom");
      return false;
    }

    // Save the encoded JSON Parameter
    this.m_oSelectedTemplate.jsonParameters = encodeURI(this.m_sParametersString);

    // We will reload and edit is false
    this.m_bIsLoading = true;
    this.m_bEditMode = false;

    if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oSelectedTemplate.templateId)) {
      // This is an existing one: update
      this.m_oProcessorParametersTemplateService.updateProcessorParameterTemplate(this.m_oSelectedTemplate).subscribe(oResponse => {
        this.getProcessorParametersTemplateList(this.m_oSelectedTemplate.processorId);
      })
    } 
    else {
      // This is a new one: set processor and user
      this.m_oSelectedTemplate.processorId = this.m_oSelectedProcessor.processorId;
      this.m_oSelectedTemplate.userId = this.m_sActiveUserId;

      // And call the API
      this.m_oProcessorParametersTemplateService.addProcessorParameterTemplate(this.m_oSelectedTemplate).subscribe({
        next: oResponse => {
          this.m_oSelectedTemplate = null;
          this.m_bIsLoading = false;
          this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
        },
        error: oError => {
          this.m_oSelectedTemplate = null;
          this.m_bIsLoading = false;          
          this.m_oNotificationDisplayService.openAlertDialog("ERROR IN SAVING YOUR PARAMETERS TEMPLATE");
        }
      })
    }
    
    return true;
  }

  /**
   * Open the share dialog
   * @param oTemplate 
   */
  openShareDialog(oTemplate: any) {
    let dialogData = new ShareDialogModel("PROCESSORPARAMETERSTEMPLATE", oTemplate);
    
    let dialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      data: dialogData
    })
  }

  /**
   * Pretty print JSON
   */
  formatJSON() {
    try {
      this.m_sParametersString = JSON.stringify(JSON.parse(this.m_sParametersString.replaceAll("'", '"')), null, 2);
    } 
    catch (error) {
      this.m_oNotificationDisplayService.openSnackBar("Error in parsing the JSON payload", "Close", "right", "bottom");
    }    
  }

  /**
   * Create a new processor Param
   */
  addProcessorParams() {
    //Prepare inputs for new information: 
    this.m_oSelectedTemplate = {
      creationDate: "",
      description: "",
      jsonParameters: "{}",
      name: "",
      processorId: "",
      templateId: "",
      updateDate: "",
      userId: ""
    };
    this.m_sParametersString = "{}";
    this.m_bEditMode = true;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
