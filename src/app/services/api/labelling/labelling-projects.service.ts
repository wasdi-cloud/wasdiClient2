import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConstantsService} from "../../constants.service";

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
   * get full details about a project.
   * @returns
   * @param sDatasetId
   */
  getDatasetById(sDatasetId: string) {
    let sUrl = this.APIURL+'?datasetId=' + sDatasetId;
    return this.m_oHttp.get<any>(sUrl);
  };

  /**
   * lisCollaborators
   * @returns
   * @param sDatasetId
   */
  lisCollaborators(sDatasetId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/admin/resourcePermissions?dataset_id=' + sDatasetId);
  };

  /**
   * invite Collab
   * @returns
   * @param oCollab
   */
  inviteCollaborator(oCollab: any) {
    return this.m_oHttp.post(this.APIURL + '/inviteCollaborator', oCollab);
  };

  /**
   * remove collab
   * @returns
   * @param sCollabId
   */
  removeCollaborator(sCollabId: string) {
    return this.m_oHttp.delete(this.APIURL + '/removeCollaborator?id=' + sCollabId);
  };

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
}
