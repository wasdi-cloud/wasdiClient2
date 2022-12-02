import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  getWorkspacesInfoListByUser() {
    return this.oHttp.get(this.APIURL + '/ws/byuser');
  };

  getWorkspaceEditorViewModel(sWorkspaceId: string) {
    return this.oHttp.get(this.APIURL + '/ws/getws?workspace=' + sWorkspaceId);
  };

  createWorkspace(sName: string = "") {

    let sRestPath = '/ws/create';

    if (sName != "") {
      sRestPath = sRestPath + "?name=" + sName;
    }

    return this.oHttp.get(this.APIURL + sRestPath);
  };

  updateWorkspace(oWorkspace: Workspace) {
    return this.oHttp.post(this.APIURL + '/ws/update', oWorkspace);
  };

  deleteWorkspace(oWorkspace: Workspace, bDeleteFile: boolean, bDeleteLayer: boolean) {

    let sUrl: string = this.APIURL;

    //REFACTOR TO REFLECT WORKSPACE
    if (oWorkspace != null) {
      if (oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
        sUrl = oWorkspace.apiUrl;
      }

      return this.oHttp.delete(sUrl + '/ws/delete?workspace=' + oWorkspace.workspaceId + '&deletefile=' + bDeleteFile + '&deletelayer=' + bDeleteLayer);
    }

    return null;
  };

  putShareWorkspace(sWorkspaceId: string, sUserId: string) {
    // return this.oHttp.put(this.APIURL + '/ws/share/add?workspace=' + sWorkspaceId + "&userId=" + sUserId);
  };

  getUsersBySharedWorkspace(sWorkspaceId: string) {
    return this.oHttp.get(this.APIURL + '/ws/share/byworkspace?workspace=' + sWorkspaceId);
  };

  deleteUserSharedWorkspace(sWorkspaceId: string, sUserId: string) {
    return this.oHttp.delete(this.APIURL + '/ws/share/delete?workspace=' + sWorkspaceId + "&userId=" + sUserId);
  };
}
