import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConstantsService } from '../constants.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { }
  getProjectsListByUser() {
    return this.m_oHttp.get(this.APIURL + '/projects/byuser');
  };

  getValidProjectsListByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/projects/byuser?valid=true');
  };

  getProjectsListBySubscription(sSubscriptionId: string) {
    return this.m_oHttp.get(this.APIURL + '/projects/bysubscription?subscription=' + sSubscriptionId);
  };

  getProjectById(sProjectId: string) {
    return this.m_oHttp.get(this.APIURL + '/projects/byId' + (sProjectId == null ? "" : "?project=" + sProjectId));
  };

  saveProject(oProject: any) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(oProject.projectId)) {
      return this.createProject(oProject);
    } else {
      return this.updateProject(oProject);
    }
  };

  createProject(oProject: any) {
    return this.m_oHttp.post(this.APIURL + '/projects/add', oProject);
  };

  updateProject(oProject: any) {
    return this.m_oHttp.put(this.APIURL + '/projects/update', oProject);
  };

  changeActiveProject(sProjectId: string) {
    return this.m_oHttp.put(this.APIURL + '/projects/active' + (sProjectId == null ? "" : "?project=" + sProjectId), {});
  };

  deleteProject(sProjectId: string) {
    return this.m_oHttp.delete(this.APIURL + '/projects/delete?project=' + sProjectId);
  };

};


