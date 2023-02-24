import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';

export interface Process {

}
@Injectable({
  providedIn: 'root'
})
export class ProcessWorkspaceServiceService {

  m_aoProcessesRunning: Array<Process> = [];
  m_aoProcessesStopped: Array<Process> = [];

  //Days
  COOKIE_EXPIRE_TIME_DAYS: number = 1;
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  //ORDER OF PROCESSES IS IMPORTANT
  TYPE_OF_PROCESS: Array<string> = ["DOWNLOAD", "PUBLISHBAND", "PUBLISH", "UPDATEPROCESSES"];

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  /**
    * Load the last 5 processes of a workspace
    * @param sWorkSpaceId
    */
  loadProcessesFromServer(sWorkspaceId: string) {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (oWorkspace !== null && oWorkspace.apiUrl !== null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get<any>(sUrl + '/process/lastbyws?workspace=' + sWorkspaceId)
  };

  /**
   * Get the paginated list of processes of a workspace
   * @param sWorkSpaceId
   * @param iStartIndex
   * @param iEndIndex
   * @returns {*}
   */
  // getAllProcessesFromServer(sWorkSpaceId: string, iStartIndex: number, iEndIndex: number) {
  //   var oWorkspace = this.oConstantsService.getActiveWorkspace();
  //   var sUrl = this.APIURL;

  //   if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
  //     sUrl = oWorkspace.apiUrl;
  //   }

  //   sUrl += '/process/byws?workspace=' + sWorkSpaceId;

  //   if (iStartIndex) {
  //     sUrl += '&startindex=' + iStartIndex;
  //   }

  //   if (iEndIndex) {
  //     sUrl += '&endindex=' + iEndIndex;
  //   }

  //   return this.oHttp.get(sUrl);
  // };

  /**
   * Get the list of process workspace of this user for this application
   * @param sProcessorName Name of the processor to search for
   * @returns {*} List of Process Workpsace View Models
   */
  getProcessesByProcessor(sProcessorName: string) {
    let sUrl = this.APIURL;
    return this.oHttp.get(sUrl + '/process/byapp?processorName=' + sProcessorName);
  };


  /**
   * Get the filtered and paginated list of processes of a workspace
   * @param sWorkSpaceId
   * @param iStartIndex
   * @param iEndIndex
   * @param sStatus
   * @param sType
   * @param sDate
   * @param sName
   * @returns {*}
   */
  getFilteredProcessesFromServer(sWorkSpaceId: string, iStartIndex: number, iEndIndex: number, sStatus: string, sType: string, sDate: string, sName: string) {
    var oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    //Will need to refactor this
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    sUrl = sUrl + '/process/byws?workspace=' + sWorkSpaceId + "&startindex=" + iStartIndex + "&endindex=" + iEndIndex;

    if (sStatus) {
      if (sStatus !== "Status...") sUrl += "&status=" + sStatus;
    }
    if (sType) {
      if (sType !== "Type...") sUrl += "&operationType=" + sType;
    }
    if (sDate) {
      sUrl += "&dateFrom=" + sDate + "&dateTo=" + sDate;
    }
    if (sName) {
      sUrl += "&namePattern=" + sName;
    }

    return this.oHttp.get<any[]>(sUrl);
  };

  /**
   * Kill (Stop) a running process
   * @param sPidInput
   * @param sWorkSpaceId
   * @param oProcess
   * @returns {boolean}
   */
  removeProcessInServer(sPidInput: string, sWorkSpaceId: string, oProcess: Process) {
    if (!sPidInput) {
      return false;
    }
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    //Will need to refactor this
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    // this.oHttp.get(sUrl + '/process/delete?procws=' + sPidInput).then(function (data, status) {
    //   if (utilsIsObjectNullOrUndefined(sWorkSpaceId) === false) {
    //     oProcess.status = "stopped";
    //     oService.m_aoProcessesStopped.push(oProcess);
    //     oService.loadProcessesFromServer(sWorkSpaceId);
    //   }
    // }, (function (data, status) {
    //   utilsVexDialogAlertTop("GURU MEDITATION<br>ERROR WHILE KILLING THE PROCESS");
    // }));
    return true;
  };

  /**
   * Get the list of running processes
   * @returns {[]}
   */
  getProcesses() {
    return this.m_aoProcessesRunning;
  };

  /**
   * Triggers the update of the WASDI process bar
   */
  updateProcessesBar = function () {
    //send a message to RootController for update the bar of processes
    // $rootScope.$broadcast('m_aoProcessesRunning:updated', true);
  };

  /**
   * Check if a file is under download in this moment
   * @param oLayer
   * @param sTypeOfProcess
   * @returns {boolean}
   */
  // checkIfFileIsDownloading(oLayer: object, sTypeOfProcess: string) {
  //   if (!oLayer) {
  //     return false;
  //   }
  //   let sProcessName = oLayer.title;
  //   let sLink = oLayer.link;
  //   if (!sProcessName) {
  //     return false;
  //   }
  //   if (!sTypeOfProcess) {
  //     return false;
  //   }

  //   let sProcess: {
  //     productName: string,
  //     operationType: string,
  //     sTypeOfProcess: string,
  //     link: string
  //   } = { productName: sProcessName, operationType: sTypeOfProcess, link: sLink };

  //   if (!sProcess) {
  //     return false;
  //   }

  //   var aoProcesses = this.getProcesses();
  //   if (!aoProcesses) {
  //     return false;
  //   }

  //   var iNumberOfProcesses = aoProcesses.length;

  //   for (var iIndex = 0; iIndex < iNumberOfProcesses; iIndex++) {
  //     /*check if the processes are equals*/
  //     //aoProcesses[iIndex].productName == sProcess.productName
  //     // if ((utilsIsSubstring(aoProcesses[iIndex].productName, sProcess.productName) === true || utilsIsSubstring(aoProcesses[iIndex].productName, sProcess.link) === true)
  //     //   && aoProcesses[iIndex].operationType == sProcess.operationType && aoProcesses[iIndex].status === "RUNNING") {
  //     //   return true;
  //     // }
  //   }
  //   return false;

  // };

  /**
   * Return the downlod Proc Type
   * @returns {string}
   */
  getTypeOfProcessProductDownload() {
    return this.TYPE_OF_PROCESS[0];
  };

  /**
   * Return the Publish Band Proc Type
   * @returns {string}
   */
  getTypeOfProcessPublishingBand() {
    return this.TYPE_OF_PROCESS[1];
  };

  /**
   * Get a single process workspace object
   * @param sProcessId
   * @returns {*}
   */
  getProcessWorkspaceById(sProcessId: string) {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    //REFACTOR:
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + '/process/byid?procws=' + sProcessId);
  };

  /**
   * Get the summary of created and running processes
   * @returns {*}
   */
  getSummary() {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    //REFACTOR
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + '/process/summary');
  };

  /**
   * Delete a process
   * @param oProcessInput
   * @returns {boolean}
   */
  deleteProcess(oProcessInput: Process) {
    let oController = this;
    let oWorkspace = this.oConstantsService.getActiveWorkspace();

    // this.m_oModalService.showModal({
    //   templateUrl: "dialogs/delete_process/DeleteProcessDialog.html",
    //   controller: "DeleteProcessController"
    // }).then(function (modal) {
    //   modal.element.modal();
    //   modal.close.then(function (result) {
    //     if (result === 'delete')
    //       oController.removeProcessInServer(oProcessInput.processObjId, oWorkspace.workspaceId, oProcessInput)
    //   });
    // });

    return true;
  };

  getProcessorStatistics(sProcessorName: string) {
    let sUrl: string = this.APIURL;
    return this.oHttp.get(sUrl + '/process/appstats?processorName=' + sProcessorName);
  };

  getProcessWorkspaceTotalRunningTimeByUserAndInterval(sUserId: string, sDateFrom: string, sDateTo: string) {
    let sUrl: string = this.APIURL + '/process/runningTime?userId=' + sUserId;

    if (sDateFrom) {
      sUrl += '&dateFrom=' + sDateFrom;
    }

    if (sDateTo) {
      sUrl += '&dateTo=' + sDateTo;
    }

    return this.oHttp.get(sUrl);
  };

  getQueuesStatus(sNodeCode: string, sStatuses: string) {
    let sUrl: string = this.APIURL + '/process/queuesStatus?';

    if (sNodeCode) {
      sUrl += '&nodeCode=' + sNodeCode;
    }

    if (sStatuses) {
      sUrl += '&statuses=' + sStatuses;
    }

    return this.oHttp.get(sUrl);
  };

  getAvailableNodesSortedByScore() {
    let sUrl = this.APIURL + '/process/nodesByScore?';

    return this.oHttp.get(sUrl);
  };
}
