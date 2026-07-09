import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../../constants.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LabellingProjectsService {
  APIURL: string = this.oConstantsService.getAPIURL() + '/labelling/datasets';
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private m_oHttp: HttpClient, private oConstantsService: ConstantsService) {
  }

  /**
   * Get public projects
   * @returns
   */
  getPublic() {
    return this.m_oHttp.get<any>(this.APIURL + '/getPublic');
  };

  /**
   * Get projects by user
   * @returns
   */
  getProjectsByUser() {
    return this.m_oHttp.get(this.APIURL + '/list');
  };


  /**
   * Triggers the dataset export and expects a ZIP file (Blob) in return.
   */
  exportDataset(oPayload: { projectId: string, includeRawData: boolean, labelFilter: string }): Observable<Blob> {
    return this.m_oHttp.post<Blob>(this.APIURL + '/export', oPayload, {
      responseType: 'blob' as 'json'
    });
  }

  /**
   * get full details about a project.
   * @returns
   * @param sDatasetId
   */
  getDatasetById(sDatasetId: string) {
    let sUrl = this.APIURL+'?datasetId=' + sDatasetId;
    return this.m_oHttp.get<any>(sUrl);
  };

  /**
   * Get Collaborators
   * @param sDatasetId
   */
  getCollaborators(sDatasetId: string) {
    // I renamed this from lisCollaborators so it matches your share-ui component call!
    return this.m_oHttp.get<any[]>(`${this.APIURL}/collaborators?datasetId=${sDatasetId}`);
  }

  /**
   * Invite Collaborator
   * @param sDatasetId
   * @param sUserId
   * @param sRoleId
   */
  addCollaborator(sDatasetId: string, sUserId: string, sRoleId: string) {
    // FIX: Using '&' to chain parameters properly
    const sUrl = `${this.APIURL}/collaborators?datasetId=${sDatasetId}&userId=${sUserId}&roleId=${sRoleId}`;
    return this.m_oHttp.post(sUrl, {});
  }

  /**
   * Remove Collaborator
   * @param sDatasetId
   * @param sUserId
   */
  deleteCollaborator(sDatasetId: string, sUserId: string) {
    // FIX: Hitting the correct endpoint and passing BOTH required parameters
    const sUrl = `${this.APIURL}/collaborators?datasetId=${sDatasetId}&userId=${sUserId}`;
    return this.m_oHttp.delete(sUrl);
  }

  /**
   * Create a project
   * @returns
   * @param oDatasetProject
   */
  createProject(oDatasetProject: any) {
    return this.m_oHttp.post(this.APIURL, oDatasetProject);
  }
  /**
   * update a project
   * @returns
   * @param sDatasetProjectId
   * @param oDatasetProject
   */
  updateProject(sDatasetProjectId:string,oDatasetProject: any) {
    oDatasetProject.id = sDatasetProjectId;
    return this.m_oHttp.put(this.APIURL, oDatasetProject);
  }

  /**
   * Deletes a labelling project (Dataset)
   * @param sDatasetId The ID of the dataset to delete
   */
  deleteProject(sDatasetId: string) {
    return this.m_oHttp.delete(this.APIURL, {
      params: { datasetId: sDatasetId },
      observe: 'response' // Helps catch empty 200 OK responses
    });
  }
}
