import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

//Angular Materials Imports:
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

//Icon Imports:
import { User } from 'src/app/shared/models/user.model';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { JsonEditorService } from 'src/app/services/json-editor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-params-library-dialog',
  templateUrl: './params-library-dialog.component.html',
  styleUrls: ['./params-library-dialog.component.css']
})
export class ParamsLibraryDialogComponent implements OnChanges, AfterViewInit {
  @ViewChild('editor') m_oEditorRef!: ElementRef;
  @ViewChild('creator') m_oCreatorRef!: ElementRef;

  /**
  * Processor View Model Template: this is the processor that we are using to add/edit/remove Parameter Templates
  */
  @Input() m_oSelectedProcessor: any = null;

  @Output() m_oSelectedTemplateEmit: EventEmitter<any> = new EventEmitter<any>();

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
  m_oSelectedTemplate: any = {
    creationDate: "",
    description: "",
    jsonParameters: "",
    name: "",
    processorId: "",
    templateId: "",
    updateDate: "",
    userId: "",
  }

  m_sParametersString: string = "{}";

  m_oUser: User = this.m_oConstantsService.getUser();

  m_bShowJsonForm: boolean = true;

  m_bShowCreateForm: boolean = false;

  m_bShowShareForm: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ParamsLibraryDialogComponent>,
    private m_oJsonEditorService: JsonEditorService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
  }

  ngAfterViewInit(): void {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.setText("");
    this.m_oJsonEditorService.initEditor();
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
      this.m_bIsLoading = false;
      if (oResponse) {

        // Clean all the selected flag
        this.cleanTemplateListSelectedStatus(oResponse);
        // Update the list
        this.m_aoParametersTemplateList = oResponse;
        if(this.m_oSelectedTemplate.name) { 
          this.m_aoParametersTemplateList.forEach(oTemplate => {
            if(oTemplate.name === this.m_oSelectedTemplate.name) {
              this.viewProcessorParams(oTemplate);
            }
          })
        } else {
          this.viewProcessorParams(this.m_aoParametersTemplateList[0]);
        }
      }
    })
    return true;
  }

  /**
   * Clean the selected flag in all elements
   * @param aoList List of Parameter Template Light View Models
   */
  cleanTemplateListSelectedStatus(aoList) {
    for (let iTemplates = 0; iTemplates < aoList.length; iTemplates++) {
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
        this.m_oSelectedTemplateEmit.emit(oTemplate);
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
      this.m_bShowCreateForm = false;
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
          this.m_oJsonEditorService.setText(this.m_sParametersString);
          // View is not edit!
          this.m_bEditMode = false;
          if (this.m_oSelectedTemplate.readOnly === true) {
            this.m_oJsonEditorService.setReadOnly(true);
          } else {
            this.m_oJsonEditorService.setReadOnly(false);
          }
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
    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_FORMAT_JSON_ERROR");
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
      this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
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

    let sConfirmOwner = `${this.m_oTranslate.instant("DIALOG_PARAMS_CONFIRM_DELETE_OWNER")} <br> <li>${oTemplate.name}</li>`;
    let sConfirmShared = `${this.m_oTranslate.instant("DIALOG_PARAMS_CONFIRM_DELETE_SHARE")} <br> <li>${oTemplate.name}</li>`;

    let sDeleteError = this.m_oTranslate.instant("DIALOG_PARAMS_DELETE_ERROR")
    let bConfirmResult: any;

    if (oTemplate.readOnly === false && oTemplate.userId !== this.m_sActiveUserId) {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmOwner, '', 'alert');
    } else {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmShared, '', 'alert');
    }

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        if(this.m_oSelectedTemplate.templateId === oTemplate.templateId) {
          this.m_oSelectedTemplate = null;
        }
        this.m_oProcessorParametersTemplateService.deleteProcessorParameterTemplate(oTemplate.templateId).subscribe({
          next: oResponse => {
            this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
            this.m_bEditMode = false;
            this.m_oSelectedTemplate = null;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sDeleteError, '', 'danger')
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
    let sJsonError: string = this.m_oTranslate.instant("DIALOG_PARSE_JSON_ERROR");
    let sSaveError: string = this.m_oTranslate.instant("DIALOG_PARAMS_SAVE_ERROR");
    try {
      // Re-read and try the JSON
      let sJSONPayload = this.m_sParametersString;
      JSON.parse(sJSONPayload);
    }
    catch (error) {
      this.m_oNotificationDisplayService.openAlertDialog(sJsonError, '', 'danger');
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
        this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
      })
    }
    else {
      // This is a new one: set processor and user
      this.m_oSelectedTemplate.processorId = this.m_oSelectedProcessor.processorId;
      this.m_oSelectedTemplate.userId = this.m_sActiveUserId;

      // And call the API
      this.m_oProcessorParametersTemplateService.addProcessorParameterTemplate(this.m_oSelectedTemplate).subscribe({
        next: oResponse => {
          this.m_bIsLoading = false;
          this.getProcessorParametersTemplateList(this.m_oSelectedProcessor.processorId);
        },
        error: oError => {
          this.m_oSelectedTemplate = null;
          this.m_bIsLoading = false;
          this.m_oNotificationDisplayService.openAlertDialog(sSaveError, '', 'danger');
        }
      })
    }

    return true;
  }

  /**
   * Pretty print JSON
   */
  formatJSON() {
    let sJsonError: string = this.m_oTranslate.instant("DIALOG_PARSE_JSON_ERROR")
    try {
      this.m_sParametersString = JSON.stringify(JSON.parse(this.m_sParametersString.replaceAll("'", '"')), null, 2);
    }
    catch (error) {
      this.m_oNotificationDisplayService.openAlertDialog(sJsonError, '', 'danger');
    }
  }

  /**
   * Create a new processor Param
   */
  addProcessorParams() {
    // Init the form in 'create mode'
    this.m_bShowCreateForm = true;
    //Open json editor for editing
    this.m_oJsonEditorService.setReadOnly(false);

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
    this.m_oJsonEditorService.setText(this.m_sParametersString);
    this.m_bEditMode = true;
  }

  isOwner(oParameter): boolean {
    if (oParameter.userId === this.m_oUser.userId) {
      return true;
    } else {
      return false;
    }
  }

  getInputValues(sLabel: string, oEvent) {
    switch (sLabel) {
      case 'name':
        this.m_oSelectedTemplate.name = oEvent.event.target.value;
        break;
      case 'description':
        this.m_oSelectedTemplate.description = oEvent.target.value;
        break;
      case 'search':
        this.m_sSearchString = oEvent.event.target.value;
        break;
    }
  }

  getJSONInput(oEvent) {
    this.m_sParametersString = this.m_oJsonEditorService.getValue();
  }

  showShareForm() {
    this.m_bShowShareForm = true;
    this.m_bShowJsonForm = false;
  }

  onDismiss() {
    this.m_oSelectedTemplateEmit.emit(null);
  }
}
