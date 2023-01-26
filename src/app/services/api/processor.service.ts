import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';

type Nullable<T> = T | null;

export interface Help {
  boolValue: boolean, 
  intValue: Nullable<number>, 
  doubleValue: Nullable<number>, 
  stringValue: string
}

export interface UIResponse {
  renderAsStrings: boolean,
  tabs: {
    name: string, 
    controls: {
      label: string, 
      maxArea: number, 
      maxRatioSide: number, 
      param: string, 
      required: boolean, 
      tooltip: string, 
      type: string 
    }
  }[]
}
@Injectable({
  providedIn: 'root'
})
export class ProcessorService {
  APIURL: string;
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();
  m_sResource: string = "/processors";

  constructor(private oHttp: HttpClient, private oConstantsService: ConstantsService) {
    this.APIURL = oConstantsService.getAPIURL();
  }

  /**
   * Get the full light list of deployed processors
   * @returns {*}
   */
  getProcessorsList() {
    return this.oHttp.get<any>(this.APIURL + this.m_sResource + "/getdeployed");
  }

  /**
     * Get the base info of a single processor
     * (same view model as returned by getProcessorsList)
     * @param sProcessorId
     * @returns {*}
     */
  getDeployedProcessor(sProcessorId: string) {
    return this.oHttp.get(this.APIURL + this.m_sResource + "/getprocessor?processorId=" + sProcessorId)
  }

  /**
    * Get the list of applications to be shown in the marketplace
    * @param oFilter
    * @returns {*}
    */
  getMarketplaceList(oFilter: object) {
    return this.oHttp.post(this.APIURL + '/processors/getmarketlist', oFilter);
  };

  /**
      * Get the details of an application for the marketplace
      * @param sApplication
      * @returns {*}
      */
  getMarketplaceDetail(sApplication: string) {
    return this.oHttp.get(this.APIURL + '/processors/getmarketdetail?processorname=' + sApplication);
  };

  /**
    * Run a user processor
    * @param sProcessorName
    * @param sJSON
    * @returns {*}
    */
  runProcessor(sProcessorName: string, sJSON: string) {
    let sEncodedJSON: string = encodeURI(sJSON);
    //Get active workspace
    let oActiveWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId: string;
    //Check that 
    if (oActiveWorkspace.workspaceId) {
      sWorkspaceId = oActiveWorkspace.workspaceId;
    }
    else {
      sWorkspaceId = "-";
    }
    return this.oHttp.post(this.APIURL + '/processors/run?name=' + sProcessorName + '&workspace=' + sWorkspaceId, sEncodedJSON);
  };

  /**
    * Delete a user processor
    * @param sProcessorId
    * @returns {*}
    */
  deleteProcessor(sProcessorId: string) {

    let oActiveWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId: string;

    if (oActiveWorkspace.workspaceId) {
      sWorkspaceId = oActiveWorkspace.workspaceId;
    }
    else {
      sWorkspaceId = "-";
    }
    return this.oHttp.get(this.APIURL + '/processors/delete?processorId=' + sProcessorId + '&workspace=' + sWorkspaceId);
  };

  /**
     * Get help of a porcessor
     * @param sProcessorName
     * @returns {*}
     */
  getHelpFromProcessor(sProcessorName: string) {
    return this.oHttp.get<Help>(this.APIURL + '/processors/help?name=' + sProcessorName);
  };


  /**
     * Upload processor data
     * @param sWorkspaceId
     * @param sName
     * @param sVersion
     * @param sDescription
     * @param sType
     * @param sJsonSample
     * @param sPublic
     * @param oBody
     * @returns {*}
     */
  // uploadProcessor(sWorkspaceId: string, sName: string, sVersion: string, sDescription: string, sType: string, sJsonSample: string, sPublic: string, oBody: object) {

  //   let oOptions = {
  //     setHeaders: { 'Content-Type': undefined }
  //   };

  //   return this.oHttp.post(this.APIURL + '/processors/uploadprocessor?workspace=' + encodeURI(sWorkspaceId) + '&name=' + encodeURI(sName) + '&version=' + encodeURI(sVersion) + '&description=' + encodeURI(sDescription) + "&type=" + encodeURI(sType) + "&paramsSample=" + encodeURI(sJsonSample) + "&public=" + encodeURI(sPublic), oBody, oOptions);
  // };

  /**
     * Get processors logs
     * @param oProcessId
     * @returns {*}
     */
  getProcessorLogs(oProcessId: object) {
    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + '/processors/logs/list?processworkspace=' + oProcessId);
  };

  /**
 * Get count a processor's logs
 * @param oProcessId
 * @returns {*}
 */
  getLogsCount(oProcessId: object) {
    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + this.m_sResource + '/logs/count?processworkspace=' + oProcessId);
  };

  /**
     * Get a page of processor's logs
     * @param oProcessId
     * @param iStartRow
     * @param iEndRow
     * @returns {*}
     */
  getPaginatedLogs(oProcessId: object, iStartRow: number, iEndRow: number) {
    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    sUrl += '/processors/logs/list?processworkspace=' + oProcessId;

    if (iStartRow) {
      sUrl += '&startrow=' + iStartRow;
    }

    if (iEndRow) {
      sUrl += '&endrow=' + iEndRow;
    }

    return this.oHttp.get(sUrl);
  };
  /**
     * Update a processor
     * @param sWorkspaceId
     * @param sProcessorId
     * @param oBody
     * @returns {*}
     */
  updateProcessor(sProcessorId: string, oBody: object) {

    return this.oHttp.post(this.APIURL + '/processors/update?processorId=' + encodeURI(sProcessorId), oBody);
  };
  /**
    * Update the details of a processor
    * @param sWorkspaceId
    * @param sProcessorId
    * @param oBody
    * @returns {*}
    */
  updateProcessorDetails(sProcessorId: string, oBody: object) {
    return this.oHttp.post(this.APIURL + '/processors/updatedetails?processorId=' + encodeURI(sProcessorId), oBody);
  };

  /**
     * Update Processor files
     * @param sWorkspaceId
     * @param sProcessorId
     * @param oBody
     * @returns {*}
     */
  //    updateProcessorFiles (sFileName: string, sProcessorId: string, oBody: ) {

  //     var oOptions = {
  //         transformRequest: angular.identity,
  //         headers: {'Content-Type': undefined}
  //     };

  //     var sWorkspaceId = this.m_oConstantsService.getActiveWorkspace();

  //     if (utilsIsObjectNullOrUndefined(sWorkspaceId) == false) {
  //         sWorkspaceId = sWorkspaceId.workspaceId;
  //     }
  //     else {
  //         sWorkspaceId = "-";
  //     }        

  //     return this.m_oHttp.post(this.APIURL + '/processors/updatefiles?workspace=' + encodeURI(sWorkspaceId) + '&processorId=' + encodeURI(sProcessorId) + '&file='+encodeURI(sFileName),oBody ,oOptions);
  // };
  /**
       * Share a processor
       * @param sProcessorId
       * @param sUserId
       * @returns {*}
       */
  //REQUIRES BODY ARGUMENT HERE
  putShareProcessor(sProcessorId: string, sUserId: string) {
    // return this.oHttp.put(this.APIURL + '/processors/share/add?processorId=' + sProcessorId + "&userId=" + sUserId);
  };

  /**
  * Get users that has access to a processor
  * @param sProcessorId
  * @returns {*}
  */
  getUsersBySharedProcessor(sProcessorId: string) {
    return this.oHttp.get(this.APIURL + '/processors/share/byprocessor?processorId=' + sProcessorId);
  };

/**
* Delete a processor sharing
* @param sProcessorId
* @param sUserId
* @returns {*}
*/deleteUserSharedProcessor(sProcessorId: string, sUserId: string) {
    return this.oHttp.delete(this.APIURL + '/processors/share/delete?processorId=' + sProcessorId + "&userId=" + sUserId);
  };

  /**
    * Force processor Refresh
    * @param sProcessorId
    * @returns {*}
    */
  redeployProcessor(sProcessorId: string) {

    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sWorkspaceId = "-";

    if (oWorkspace) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    return this.oHttp.get(this.APIURL + '/processors/redeploy?processorId=' + sProcessorId + "&workspace=" + sWorkspaceId);
  };

  /**
   * Force library Update
   * @param sProcessorId
   * @returns {*}
   */
  forceLibUpdate(sProcessorId: string) {

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId = "-";

    if (oWorkspace) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    return this.oHttp.get(this.APIURL + '/processors/libupdate?processorId=' + sProcessorId + "&workspace=" + sWorkspaceId);
  };
  /**
         * Force environment Update
         * @param sProcessorId
         * @param sEnvUpdCommand
         * @returns {*}
         */
  forceEnvUpdate(sProcessorId: string, sEnvUpdCommand: string) {

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId = "-";

    if (oWorkspace) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    return this.oHttp.get(this.APIURL + '/processors/environmentupdate?processorId=' + sProcessorId + "&workspace=" + sWorkspaceId + "&updateCommand=" + sEnvUpdCommand);
  };

  /**
  * Download a processor
  * @param sProcessorId
  * @param sUrl
  */
  downloadProcessor(sProcessorId: string, sUrl: string = "") {
    let urlParams = "?" + "token=" + this.oConstantsService.getSessionId();
    urlParams = urlParams + "&" + "processorId=" + sProcessorId;

    var sAPIUrl = this.APIURL;

    if (typeof sUrl !== "undefined") {
      if (sUrl !== null) {
        if (sUrl !== "") {
          sAPIUrl = sUrl;
        }
      }
    }

    window.location.href = sAPIUrl + "/processors/downloadprocessor" + urlParams;
  };

  /**
  * Get the representation of the Processor UI
  * @param sProcessorName
  * @returns {*}
  */
  getProcessorUI(sProcessorName: string) {
    return this.oHttp.get<UIResponse>(this.APIURL + '/processors/ui?name=' + sProcessorName);
  }

  /**
  * Save the Processor UI JSON Definition
  * @param sProcessorName name of the processor
  * @param sProcessorUI string with the json
  * @returns {*}
  */
  saveProcessorUI(sProcessorName: string, sProcessorUI: string) {
    return this.oHttp.post(this.APIURL + '/processors/saveui?name=' + sProcessorName, sProcessorUI);
  }
}
