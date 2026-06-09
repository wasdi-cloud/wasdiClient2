import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../../constants.service";

@Injectable({
  providedIn: 'root',
})
export class LabellingTemplatesService {
  APIURL: string = this.oConstantsService.getAPIURL() + '/labelling/templates';
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private m_oHttp: HttpClient, private oConstantsService: ConstantsService) {
  }

  /**
   * get list of templates
   * @returns
   */
  getListByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/list');
  };

  /**
   * create template
   * @returns
   * @param oTemplate
   */
  create(oTemplate: any) {
    return this.m_oHttp.post(this.APIURL, oTemplate,{ responseType: 'text' });
  };

  /**
   * update a template
   * @returns
   * @param sTemplateId
   * @param oTemplate
   */
  update(oTemplate: any) {
    return this.m_oHttp.get<any>(this.APIURL, oTemplate);
  };

  /**
   * delete a template
   * @returns
   * @param sTemplateId
   */
  delete(sTemplateId: string) {
    return this.m_oHttp.delete<any>(this.APIURL + '?templateId=' + sTemplateId);
  };

  /**
   * get Template By Project
   * @returns
   * @param sProjectId
   */
  getByProject(sProjectId: string) {
    return this.m_oHttp.get(this.APIURL + '/getByProject?project_id=' + sProjectId);
  };
  /**
   * get Template By Id
   * @returns
   * @param sTemplateId
   */
  getById(sTemplateId: string) {
    return this.m_oHttp.get(this.APIURL + '?templateId=' + sTemplateId);
  };

  /**
   * Get attributes of template
   * @param sNodeCode
   * @returns
   */
  getAttributes(sTemplateId: string) {
    return this.m_oHttp.get(this.APIURL + '/getAttributes?template_id=' + sTemplateId);
  };

}
