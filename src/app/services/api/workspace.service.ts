import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

export interface WorkspaceViewModel {
  activeNode: boolean;
  apiUrl: string;
  cloudProvider: string;
  creationDate: number;
  lastEditDate: number;
  name: string;
  nodeCode: string;
  processesCount: string;
  sharedUsers: string[];
  slaLink: string;
  userId: string;
  workspaceId: string;
}

export interface oConfirmation {
  boolValue: boolean | null,
  doubleValue: number | null,
  intValue: number | null,
  stringValue: string | null
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  getWorkspacesInfoListByUser() {
    return this.oHttp.get<Workspace[]>(this.APIURL + '/ws/byuser');
  };

  getWorkspaceEditorViewModel(sWorkspaceId: string) {
    return this.oHttp.get<WorkspaceViewModel>(this.APIURL + '/ws/getws?workspace=' + sWorkspaceId);
  };

  createWorkspace(sName: string) {

    let sRestPath = '/ws/create';

    if (sName !== "") {
      sRestPath = sRestPath + "?name=" + sName;
    }

    return this.oHttp.get<oConfirmation>(this.APIURL + sRestPath);
  };

  updateWorkspace(oWorkspace: Workspace) {
    return this.oHttp.post(this.APIURL + '/ws/update', oWorkspace);
  };

  deleteWorkspace(oWorkspace: any, bDeleteFile: boolean, bDeleteLayer: boolean) {

    let sUrl: string = this.APIURL;

    if (oWorkspace) {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
        sUrl = oWorkspace.apiUrl;
      }

      return this.oHttp.delete(sUrl + '/ws/delete?workspace=' + oWorkspace.workspaceId + '&deletefile=' + bDeleteFile + '&deletelayer=' + bDeleteLayer);
    }

    return null;
  };

  putShareWorkspace(sWorkspaceId: string, sUserId: string, sRights: string) {
    return this.oHttp.put<oConfirmation>(this.APIURL + '/ws/share/add?workspace=' + sWorkspaceId + "&userId=" + sUserId + "&rights=" + sRights, {});
  };

  getUsersBySharedWorkspace(sWorkspaceId: string) {
    return this.oHttp.get(this.APIURL + '/ws/share/byworkspace?workspace=' + sWorkspaceId);
  };

  deleteUserSharedWorkspace(sWorkspaceId: string, sUserId: string) {
    return this.oHttp.delete<oConfirmation>(this.APIURL + '/ws/share/delete?workspace=' + sWorkspaceId + "&userId=" + sUserId);
  };
}
