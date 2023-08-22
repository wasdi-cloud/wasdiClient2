import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  APIURL: string = this.oConstantsService.getAPIURL();

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  // header field for post calls
  //    this.m_oOptions = {
  //     transformRequest: angular.identity,
  //     headers: { 'Content-Type': undefined }
  //    };

  //Run a workflow by Id
  executeGraphFromWorkflowId(sWorkspaceInput: string, oSnapWorkflowViewModel: object) {
    return this.oHttp.post<any>(this.APIURL + '/workflows/run?workspace=' + sWorkspaceInput, oSnapWorkflowViewModel);
  };

  // Upload a workflow by file
  uploadByFile(sWorkspaceInput: string, sName: string, sDescription: string, oBody: object, bIsPublic: boolean) {
    // return this.oHttp.post(this.APIURL + '/workflows/uploadfile?workspace=' + sWorkspaceInput + "&name=" + sName +
    //     "&description=" + sDescription + "&public=" + bIsPublic, oBody, this.m_oOptions);
  };

  // Update workflow xml file
  updateGraphFile(sWorkflowId: string, oBody: object) {
    // return this.oHttp.post(this.APIURL + '/workflows/updatefile?workflowid=' + sWorkflowId, oBody, this.m_oOptions);
  }

  // Update workflow parameters
  updateGraphParameters(sWorkflowId: string, sName: string, sDescription: string, bIsPublic: boolean) {
    //Needs argument for the body
    // return this.oHttp.post(this.APIURL + '/workflows/updateparams?workflowid=' + sWorkflowId +
    //   '&name=' + sName +
    //   '&description=' + sDescription +
    //   '&public=' + bIsPublic);
  }

  // Delete workflow
  deleteWorkflow(sWorkflowId: string) {
    return this.oHttp.get(this.APIURL + '/workflows/delete?workflowId=' + sWorkflowId, { observe: 'response' });
  };

  // Get Workflow list by user
  getWorkflowsByUser() {
    return this.oHttp.get<any>(this.APIURL + '/workflows/getbyuser', { observe: 'response' });
  };

  // Download workflow file
  downloadWorkflow(sWorkflowId: string, sUrl: string = "") {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "workflowId=" + sWorkflowId;

    var sAPIUrl = this.APIURL;

    if (typeof sUrl !== "undefined") {
      if (sUrl !== null) {
        if (sUrl !== "") {
          sAPIUrl = sUrl;
        }
      }
    }

    window.location.href = sAPIUrl + "/workflows/download" + urlParams;
  };

  /************************************ SHARINGS **************************************************/

  // Get list of shared users by workflow id
  getUsersBySharedWorkflow(sWorkflowId: string) {
    return this.oHttp.get(this.APIURL + '/workflows/share/byworkflow?workflowId=' + sWorkflowId);
  }

  // Add sharing
  addWorkflowSharing(sWorkflowId: string, sUserId: string) {
    // return this.oHttp.put(this.APIURL + '/workflows/share/add?workflowId=' + sWorkflowId + '&userId=' + sUserId);
  }

  // Remove sharing
  removeWorkflowSharing(sWorkflowId: string, sUserId: string) {
    return this.oHttp.delete(this.APIURL + '/workflows/share/delete?workflowId=' + sWorkflowId + '&userId=' + sUserId);

  }

  // Get workflow xml
  getWorkflowXml(sWorkflowId: string) {
    return this.oHttp.get(this.APIURL + '/workflows/getxml?workflowId=' + sWorkflowId);
  }

  // Update workflow xml
  postWorkflowXml(sWorkflowId: string, sWorkflowXml: string) {
    // return this.oHttp.post(this.APIURL + '/workflows/updatexml?workflowId=' + sWorkflowId, sWorkflowXml, this.m_oOptions);
  }
}
