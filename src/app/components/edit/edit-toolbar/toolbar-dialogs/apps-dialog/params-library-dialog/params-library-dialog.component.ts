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

  m_oSelectedProcessor: any;


  m_sProcessorId: string = "";
  m_sActiveUserId: string = "";
  m_sInputTemplateId: string = "";
  m_sSearchString: string = "";

  m_aoParamsTemplates: any = [];
  m_aoParamsTemplatesMap: any[] = [];

  m_bIsLoading: boolean = false;
  m_bEditMode: boolean = false;

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

  m_oProcessorParametersTemplate: any = {} as {
    processorId: string,
    jsonParameters: string,
    name: string,
    description: string
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
    this.m_oSelectedProcessor = data;
    this.m_sProcessorId = this.m_oSelectedProcessor.processorId;
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    this.getProcessorParametersTemplateList(this.m_sProcessorId);
    if (this.m_oProcessorParametersTemplate.description === undefined) {
      this.m_oProcessorParametersTemplate.description = "";
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorParametersTemplate.jsonParameters)) {
      this.m_oProcessorParametersTemplate.jsonParameters = "{}";
    }

    this.m_oProcessorParametersTemplate.processorId = this.m_sProcessorId;
  }

  /**
     * Get the list of processor parameters templates for the current user and the current processor.
     * @param sProcessorId
     * @returns {boolean}
     */
  getProcessorParametersTemplateList(sProcessorId: string) {
    if (!sProcessorId) {
      return false;
    }
    this.m_oProcessorParametersTemplateService.getProcessorParametersTemplatesListByProcessor(sProcessorId).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoParamsTemplates = oResponse;
        this.m_oProcessorParametersTemplate.jsonParameters = decodeURIComponent(this.m_oProcessorParametersTemplate.jsonParameters)
      }
    })
    return true;
  }

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

  viewProcessorParams(oTemplate: any) {
    if (oTemplate) {
      this.m_oProcessorParametersTemplateService.getProcessorParametersTemplate(oTemplate.templateId).subscribe(oResponse => {
        if (oResponse) {
          console.log(oResponse);
          this.m_oSelectedTemplate = oResponse;
          this.m_oProcessorParametersTemplate = oResponse;
          this.m_oProcessorParametersTemplate.jsonParameters = decodeURIComponent(this.m_oProcessorParametersTemplate.jsonParameters)
          this.m_sParametersString = decodeURIComponent(this.m_oProcessorParametersTemplate.jsonParameters);
          this.m_bEditMode = false;
        }
      })

    }
  }

  editProcessorParametersTemplate(oTemplate) {
    if (!this.m_oProcessorParametersTemplate) {
      return false;
    }
    if (!oTemplate) {
      return false;
    }

    this.m_bEditMode = true;
    console.log(oTemplate)
    this.m_oProcessorParametersTemplateService.getProcessorParametersTemplate(oTemplate.templateId).subscribe(oResponse => {
      if (oResponse) {
        this.m_oProcessorParametersTemplate = oResponse;
        try {
          let sJSONPayload = decodeURIComponent(this.m_oProcessorParametersTemplate.jsonParameters);
          let oParsed = JSON.parse(sJSONPayload);
          let sPrettyPrint = JSON.stringify(oParsed, null, 2);
          this.m_oProcessorParametersTemplate.jsonParameters = sPrettyPrint;
          this.m_bIsLoading = false;
        } catch (error) {
          console.log(error);
          this.m_bIsLoading = false;
        }
      } else {
        //ERROR DIALOG
        console.log("Error loading processor parameters template detail");
        this.m_bIsLoading = false;
      }


    })

    return true;
  }

  deleteProcessorParams(oTemplate: any) {
    if (!oTemplate) {
      return false;
    }

    let sConfirmOwner = `Are you sure you want to delete ${oTemplate.name}?`;
    let sConfirmShared = `Are you sure you want to remove your permissions from ${oTemplate.name}`;

    let bConfirmResult: any;

    if (oTemplate.sharedWithMe) {
      bConfirmResult.m_oNotificationDisplayService.openConfirmationDialog(sConfirmShared);
    } else {
      bConfirmResult.m_oNotificationDisplayService.openConfirmationDialog(sConfirmOwner);
    }

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oProcessorParametersTemplateService.deleteProcessorParameterTemplate(oTemplate.templateId).subscribe({
          next: oResponse => {
            this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
            this.m_bEditMode = false;
            this.m_oProcessorParametersTemplate = null;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(`Error in deleting ${oTemplate.name}`)
          }
        });
      }
    })
    return true;
  }

  saveTemplate() {
    try {
      console.log(this.m_oProcessorParametersTemplate.jsonParameters);
      let sJSONPayload = this.m_oProcessorParametersTemplate.jsonParameters
      JSON.parse(sJSONPayload);
    } catch (error) {
      //ADD ERROR DIALOG
      console.log("error in parsing the JSON payload");
      return false;
    }

    this.m_oProcessorParametersTemplate.jsonParameters = encodeURI(this.m_sParametersString);

    this.m_bIsLoading = true;
    if (this.m_oProcessorParametersTemplate.templateId) {
      this.m_oProcessorParametersTemplateService.updateProcessorParameterTemplate(this.m_oProcessorParametersTemplate).subscribe(oResponse => {

        this.getProcessorParametersTemplateList(this.m_oProcessorParametersTemplate.processorId);
      })
    } else {
      this.m_oProcessorParametersTemplateService.addProcessorParameterTemplate(this.m_oProcessorParametersTemplate).subscribe({
        next: oResponse => {
          this.m_bEditMode = false;
          this.m_oProcessorParametersTemplate = null;
          this.m_bIsLoading = false;
          this.getProcessorParametersTemplateList(this.m_sProcessorId);

        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("ERROR IN SAVING YOUR PARAMETERS TEMPLATE");
        }
      })
    }

    this.m_bEditMode = false;
    return true;
  }

  openShareDialog(oTemplate: any) {
    let dialogData = new ShareDialogModel("PROCESSORPARAMETERSTEMPLATE", oTemplate);
    console.log(dialogData);
    let dialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      data: dialogData
    })
  }

  formatJSON() {
    this.m_sParametersString = JSON.stringify(JSON.parse(this.m_sParametersString.replaceAll("'", '"')), null, 2);
  }

  addProcessorParams() {
    //Prepare inputs for new information: 
    this.m_oSelectedTemplate = {
      creationDate: "",
      description: "",
      jsonParameters: "",
      name: "",
      processorId: "",
      templateId: "",
      updateDate: "",
      userId: ""
    };
    this.m_sParametersString = ""
    this.m_bEditMode = true;
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
