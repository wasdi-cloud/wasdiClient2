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
   * @param sLabbelingTempaletId
   */
  getList(sLabbelingTempaletId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/getList?labelling_template_url=' + sLabbelingTempaletId);
  };

  /**
   * create template
   * @returns
   * @param oTemplate
   */
  create(oTemplate: any) {
    return this.m_oHttp.post(this.APIURL + '/create', oTemplate);
  };

  /**
   * update a template
   * @returns
   * @param sTemplateId
   * @param oTemplate
   */
  update(sTemplateId: string, oTemplate: any) {
    return this.m_oHttp.get<any>(this.APIURL + '/update?template_id=' + sTemplateId, oTemplate);
  };

  /**
   * delete a template
   * @returns
   * @param sTemplateId
   */
  delete(sTemplateId: string) {
    return this.m_oHttp.delete<any>(this.APIURL + '/delete/?template_id=' + sTemplateId);
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
   * Get attributes of template
   * @param sNodeCode
   * @returns
   */
  getAttributes(sTemplateId: string) {
    return this.m_oHttp.get(this.APIURL + '/getAttributes?template_id=' + sTemplateId);
  };

}
