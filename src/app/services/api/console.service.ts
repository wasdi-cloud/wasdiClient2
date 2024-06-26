import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

import { HttpResponse as defaultResponse } from 'src/app/shared/models/http-response.model';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();
  m_sResource: string = "/console";

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  /**
      * Create a Console for the actual user in the specified workspace
      * @param sWorkspaceId Id of the workspace
      * @returns {*}
      */
  createConsole(sWorkspaceId: string) {

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    //Prevent double back slash in url
    if (sUrl.endsWith('/')) {
      sUrl.slice(1, -1);
    }

    return this.oHttp.post<defaultResponse>(sUrl + this.m_sResource + '/create?workspaceId=' + sWorkspaceId, {});
  };

  /**
   * Verify if there is a console (JupyterLab) for this user in this workspace
   * @param {String} sWorkspaceId Id of the workspace
   * @returns http promise
   */
  isConsoleReady(sWorkspaceId: string) {
    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get<any>(sUrl + this.m_sResource + '/ready?workspaceId=' + sWorkspaceId);
  }
}
