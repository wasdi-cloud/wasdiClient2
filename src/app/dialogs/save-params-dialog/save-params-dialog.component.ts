import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProcessorParamsTemplateService } from 'src/app/services/api/processor-params-template.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-save-params-dialog',
  templateUrl: './save-params-dialog.component.html',
  styleUrls: ['./save-params-dialog.component.css']
})
export class SaveParamsDialogComponent implements OnInit {
  m_sParametersString: string = "";

  m_oTemplate: any = {} as {
    creationDate: string;
    description: string;
    jsonParameters: string;
    name: string;
    processorId: string;
    templateId: string;
    updateDate: string;
    userId: string;
  };

  m_oSelectedProcessor = null;

  m_sActiveUserId: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorParametersTemplateService: ProcessorParamsTemplateService,
  ) { }

  ngOnInit(): void {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData)) {
      this.m_sParametersString = this.m_oData.params;
      this.m_oSelectedProcessor = this.m_oData.processor;
    }

    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
  }

  getInput(oEvent: any) {
    this.m_oTemplate.description = oEvent.target.value;
  }

  saveTemplate() {
    //Encode Template recieved from App UI Parent
    let sJSONPayload = JSON.parse(this.m_sParametersString);
    this.m_oTemplate.jsonParameters = encodeURI(this.m_sParametersString);

    this.m_oTemplate.processorId = this.m_oSelectedProcessor.processorId;
    this.m_oTemplate.userId = this.m_sActiveUserId;


    // And call the API
    this.m_oProcessorParametersTemplateService.addProcessorParameterTemplate(this.m_oTemplate).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar("Template Saved!", "Close");
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("ERROR IN SAVING YOUR PARAMETERS TEMPLATE");
      }
    })
  }

  onDismiss() { }
}
