import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ConstantsService } from '../constants.service';
import { NotificationDisplayService } from '../notification-display.service';
import { TranslateService } from '@ngx-translate/core';

import { Workspace } from 'src/app/shared/models/workspace.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

export interface Process {
  fileSize: string,
  lastChangeDate: string,
  operationDate: string
  operationEndDate: string
  operationStartDate: string
  operationSubType: string
  operationType: string
  payload: any
  pid: number
  processObjId: string
  productName: string
  progressPerc: number
  status: string
  userId: string
  workspaceId: string
}
@Injectable({
  providedIn: 'root'
})
export class ProcessWorkspaceService {
  /**
   * Behaviour subject for emitting the running processes
   */
  m_aoProcessesRunning: BehaviorSubject<Process[]> = new BehaviorSubject<Process[]>([]);
  m_aoProcessesRunning$ = this.m_aoProcessesRunning.asObservable();

  /**
   * Stopped processes
   */
  m_aoProcessesStopped: Array<Process> = [];

  /**
   * Cookie expiration time
   */
  COOKIE_EXPIRE_TIME_DAYS: number = 1;

  /**
   * API URL from constants service
   */
  APIURL: string = this.m_oConstantsService.getAPIURL();

  /**
   * Flag to check if the workspace api url should be ignored
   */
  m_bIgnoreWorkspaceApiUrl: boolean = this.m_oConstantsService.getIgnoreWorkspaceApiUrl();

  /**
   * The types of processes - DO NOT CHANGE ORDER!!!!
   */
  TYPE_OF_PROCESS: Array<string> = ["DOWNLOAD", "PUBLISHBAND", "PUBLISH", "UPDATEPROCESSES"];

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService,
    private m_oHttp: HttpClient) { }

  /**
    * Load the last 5 processes of a workspace
    * @param sWorkSpaceId
    */
  loadProcessesFromServer(sWorkspaceId: string) {
    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get<any>(sUrl + '/process/lastbyws?workspace=' + sWorkspaceId).subscribe(oResponse => {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
        // this.m_aoProcessesRunning = oResponse; 
        this.setProcessesRunning(oResponse.reverse());
        //this.updateProcessesBar("m_aoProcessesRunning:updated", true);
      }
    });
  };

  /**
   * Set Processes Running
   * @param aoProcesses 
   * @returns 
   */
  setProcessesRunning(aoProcesses: Process[]) {
    return this.m_aoProcessesRunning.next(aoProcesses);
  }

  /**
   * Return m_aoProcessesRunning
   */
  getProcessesRunning(): Observable<Process[]> {
    return this.m_aoProcessesRunning$;
  }

  /**
   * Get the paginated list of processes of a workspace
   * @param sWorkSpaceId
   * @param iStartIndex
   * @param iEndIndex
   * @returns {*}
   */
  getAllProcessesFromServer(sWorkSpaceId: string, iStartIndex: number, iEndIndex: number) {
    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    sUrl += '/process/byws?workspace=' + sWorkSpaceId;

    if (iStartIndex) {
      sUrl += '&startindex=' + iStartIndex;
    }

    if (iEndIndex) {
      sUrl += '&endindex=' + iEndIndex;
    }

    return this.m_oHttp.get<any>(sUrl);
  };

  /**
   * Get the list of process workspace of this user for this application
   * @param sProcessorName Name of the processor to search for
   * @returns {*} List of Process Workpsace View Models
   */
  getProcessesByProcessor(sProcessorName: string) {
    let sUrl = this.APIURL;
    return this.m_oHttp.get(sUrl + '/process/byapp?processorName=' + sProcessorName);
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
    var oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
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

    return this.m_oHttp.get<any[]>(sUrl);
  };

  /**
   * Kill (Stop) a running process
   * @param sPidInput
   * @param sWorkSpaceId
   * @param oProcess
   * @returns {boolean}
   */
  removeProcessInServer(sPidInput: string, sWorkSpaceId: string, oProcess: Process) {
    let oService = this;
    if (!sPidInput) {
      return false;
    }
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    this.m_oHttp.get<any>(sUrl + '/process/delete?procws=' + sPidInput).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(sWorkSpaceId) === false) {
          oProcess.status = "stopped";
          this.m_aoProcessesStopped.push(oProcess);
          this.loadProcessesFromServer(sWorkSpaceId);
        }
      },
      error: oError => {
        oService.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("DELETE_PROCESS_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION"), 'danger');
      }
    }
    );
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
   * Check if a file is under download in this moment
   * @param oLayer
   * @param sTypeOfProcess
   * @returns {boolean}
   */
  checkIfFileIsDownloading(oLayer: any, sTypeOfProcess: string) {
    if (!oLayer) {
      return false;
    }
    let sProcessName = oLayer.title;
    let sLink = oLayer.link;
    if (!sProcessName) {
      return false;
    }
    if (!sTypeOfProcess) {
      return false;
    }

    let sProcess = { productName: sProcessName, operationType: sTypeOfProcess, link: sLink };

    if (!sProcess) {
      return false;
    }

    let aoProcesses = this.getProcesses();
    if (!aoProcesses) {
      return false;
    }

    return false;
  };

  /**
   * Return the download Proc Type
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
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get<any>(sUrl + '/process/byid?procws=' + sProcessId);
  };

  /**
   * Get the status of a process by ID
   * @param sProcessId  Id of the process workspace
   * @returns Name of the Status: CREATED, RUNNING, WAITING, READY, DONE, ERROR, STOPPED
   */
  getProcessWorkspaceStatusId(sProcessId: string) {
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get<string>(sUrl + '/process/getstatusbyid?procws=' + sProcessId);
  };

  /**
   * Get the summary of created and running processes
   * @returns {*}
   */
  getSummary() {
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get<any>(sUrl + '/process/summary');
  };

  /**
   * Delete a process
   * @param oProcessInput
   * @returns {boolean}
   */
  deleteProcess(oProcessInput: Process) {
    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();

    this.m_oNotificationDisplayService.openConfirmationDialog(this.m_oTranslate.instant("DELETE_PROCESS_QUESTION"), this.m_oTranslate.instant("KEY_PHRASES.CONFIRM_REMOVAL"), 'alert').subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.removeProcessInServer(oProcessInput.processObjId, oWorkspace.workspaceId, oProcessInput)
      }
    })

    return true;
  };

  getProcessorStatistics(sProcessorName: string) {
    let sUrl: string = this.APIURL;
    return this.m_oHttp.get<any>(sUrl + '/process/appstats?processorName=' + sProcessorName);
  };

  getProcessWorkspaceTotalRunningTimeByUserAndInterval(sUserId: string, sDateFrom: string, sDateTo: string) {
    let sUrl: string = this.APIURL + '/process/runningTime/UI?userId=' + sUserId;

    if (sDateFrom) {
      sUrl += '&dateFrom=' + sDateFrom;
    }

    if (sDateTo) {
      sUrl += '&dateTo=' + sDateTo;
    }

    return this.m_oHttp.get<number>(sUrl);
  };

  getProcessWorkspaceTimeByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/process/runningtimeproject/byuser');
  }

  getProcessWorkspaceTimeByProject() {
    return this.m_oHttp.get<any>(this.APIURL + '/process/runningtimeproject');
  }

  getQueuesStatus(sNodeCode: string, sStatuses: string) {
    let sUrl: string = this.APIURL + '/process/queuesStatus?';

    if (sNodeCode) {
      sUrl += '&nodeCode=' + sNodeCode;
    }

    if (sStatuses) {
      sUrl += '&statuses=' + sStatuses;
    }

    return this.m_oHttp.get(sUrl);
  };

  getAvailableNodesSortedByScore() {
    let sUrl = this.APIURL + '/process/nodesByScore?';

    return this.m_oHttp.get<any[]>(sUrl);
  };
}
