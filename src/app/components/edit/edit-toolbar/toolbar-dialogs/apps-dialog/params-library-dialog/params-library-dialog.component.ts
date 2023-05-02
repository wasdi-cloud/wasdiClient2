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


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ParamsLibraryDialogComponent>,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
  ) {
    this.m_oSelectedProcessor = data;
    this.m_sProcessorId = this.m_oSelectedProcessor.processorId;
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    console.log(this.m_oSelectedProcessor);
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

  formatJSON() {

  }

  addProcessorParams() {

  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
