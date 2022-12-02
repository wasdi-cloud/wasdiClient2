import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessorParamsTemplateService {
  APIURL: string = this.oConstantsService.getAPIURL();
  m_sResource: string = "/processorParamTempl"

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }
  /**
     * Get the processor parameter templates list associated with a processor.
     * @param sProcessorId
     * @returns {*}
     */
  getProcessorParametersTemplatesListByProcessor(sProcessorId: string) {
    return this.oHttp.get(this.APIURL + this.m_sResource + '/getlist?processorId=' + sProcessorId);
  };

  /**
   * Get the processor parameter template by template Id.
   * @param sTemplateId
   * @returns {*}
   */
  getProcessorParametersTemplate(sTemplateId: string) {
    return this.oHttp.get(this.APIURL + this.m_sResource + '/get?templateId=' + sTemplateId);
  };

  /**
   * Update the processor parameter template.
   * @param oTemplate the processor parameter template
   * @returns {*}
   */
  updateProcessorParameterTemplate(oTemplate: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/update', oTemplate);
  }

  /**
   * Add the processor parameter template.
   * @param oTemplate the processor parameter template
   * @returns {*}
   */
  addProcessorParameterTemplate(oTemplate: object) {
    return this.oHttp.post(this.APIURL + this.m_sResource + '/add', oTemplate);
  }

  /**
   * Delete the processor parameter template.
   * @param sTemplateId
   * @returns {*}
   */
  deleteProcessorParameterTemplate(sTemplateId: string) {
    return this.oHttp.delete(this.APIURL + this.m_sResource + '/delete?templateId=' + sTemplateId);
  };

}
