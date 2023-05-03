import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { faBook, faPlus, faShareNodes, faUpload, faX } from '@fortawesome/free-solid-svg-icons';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';

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

  m_aoParamsTemplates: any = [];
  m_sInputTemplateId: string = "";
  m_bIsLoading: boolean = false;
  m_sSearchString: string = "";
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

  m_sParametersString: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ParamsLibraryDialogComponent>,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
  ) {
    this.m_oSelectedProcessor = data;
    console.log(this.m_oSelectedProcessor);
    this.m_sProcessorId = this.m_oSelectedProcessor.processorId;
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    this.getProcessorParametersTemplateList(this.m_sProcessorId);
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
      console.log(oResponse);
      if (oResponse) {
        this.m_aoParamsTemplates = oResponse;
      }
    })
    return true;
  }

  applyProcessorParams(sTemplateId: string) {

  }

  viewProcessorParams(oTemplate: any) {
    if (oTemplate) {
      this.m_oProcessorParametersTemplateService.getProcessorParametersTemplate(oTemplate.templateId).subscribe(oResponse => {
        if (oResponse) {
          this.m_oSelectedTemplate = oResponse;
          this.m_sParametersString = decodeURIComponent(this.m_oSelectedTemplate.jsonParameters);
          this.m_bEditMode = false;
        }
      })

    }
  }

  deleteProcessorParams(oTemplate: any) {
    if (!oTemplate) {
      return false;
    }

    let sConfirmOwner = `Are you sure you want to delete ${oTemplate.name}?`;
    let sConfirmShared = `Are you sure you want to remove your permissions from ${oTemplate.name}`;

    let oDialogData = ConfirmationDialogModel;

    if (oTemplate.sharedWithMe) {
      oTemplate = new ConfirmationDialogModel("Confirm Removal", sConfirmShared)
    } else {
      oTemplate = new ConfirmationDialogModel("Confirm Removal", sConfirmOwner)
    }

    return true;
  }

  saveTemplate() {

  }

  openShareDialog(oTemplate: any) {
    let dialogData = new ShareDialogModel("PROCESSORPARAMETERSTEMPLATE", oTemplate);
    console.log(dialogData);
    let dialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      data: dialogData
    })
  }

  editMode() {
    this.m_bEditMode = !this.m_bEditMode;
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
