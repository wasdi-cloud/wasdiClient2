import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';
import { BehaviorSubject, Observable } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogTopService } from '../alert-dialog-top.service';

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

  m_aoProcessesRunning: BehaviorSubject<Process[]> = new BehaviorSubject<Process[]>([]);
  _m_aoProcessesRunning$ = this.m_aoProcessesRunning.asObservable();
  m_aoProcessesStopped: Array<Process> = [];

  updateProcessBarMsg: BehaviorSubject<string> = new BehaviorSubject<string>("Intial Status");
  updatePrcoessBarMsg$ = this.updateProcessBarMsg.asObservable();

  //Days
  COOKIE_EXPIRE_TIME_DAYS: number = 1;
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  //ORDER OF PROCESSES IS IMPORTANT
  TYPE_OF_PROCESS: Array<string> = ["DOWNLOAD", "PUBLISHBAND", "PUBLISH", "UPDATEPROCESSES"];

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private oHttp: HttpClient) { }

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

    return this.oHttp.get<any>(sUrl + '/process/lastbyws?workspace=' + sWorkspaceId).subscribe(oResponse => {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
        // this.m_aoProcessesRunning = oResponse; 
        this.setProcessesRunning(oResponse.reverse());
        this.updateProcessesBar("m_aoProcessesRunning:updated");
      }
    });
  };

  /**
   * Set Processes Running
   * @param aoPrcoesses 
   * @returns 
   */
  setProcessesRunning(aoPrcoesses: Process[]) {
    return this.m_aoProcessesRunning.next(aoPrcoesses);
  }

  /**
   * Return m_aoProcessesRunning
   * 
   */
  getProcessesRunning(): Observable<Process[]> {
    return this._m_aoProcessesRunning$;
  }

  /**
   * Get the paginated list of processes of a workspace
   * @param sWorkSpaceId
   * @param iStartIndex
   * @param iEndIndex
   * @returns {*}
   */
  getAllProcessesFromServer(sWorkSpaceId: string, iStartIndex: number, iEndIndex: number) {
    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;

    if (oWorkspace !== null && oWorkspace.apiUrl !== null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    sUrl += '/process/byws?workspace=' + sWorkSpaceId;

    if (iStartIndex) {
      sUrl += '&startindex=' + iStartIndex;
    }

    if (iEndIndex) {
      sUrl += '&endindex=' + iEndIndex;
    }

    return this.oHttp.get<any>(sUrl);
  };

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
    let oService = this;
    if (!sPidInput) {
      return false;
    }
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    //Will need to refactor this
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    this.oHttp.get<any>(sUrl + '/process/delete?procws=' + sPidInput).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(sWorkSpaceId) === false) {
          oProcess.status = "stopped";
          this.m_aoProcessesStopped.push(oProcess);
          this.loadProcessesFromServer(sWorkSpaceId);
        }
      },
      error: oError => {
        oService.m_oAlertDialog.openDialog(4000, "GURU MEDITATION<br>ERROR WHILE KILLING THE PROCESS")
      }
    }
    );



    //   function (data, status) {
    //
    // }, (function (data, status) {
    //  
    //   // FadeoutUtils.utilsVexDialogAlertTop("GURU MEDITATION<br>ERROR WHILE KILLING THE PROCESS");
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
  updateProcessesBar(sMessage: string) {
    //send a message to RootController for update the bar of processes
    // $rootScope.$broadcast('m_aoProcessesRunning:updated', true);
    this.updateProcessBarMsg.next(sMessage);
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

    return this.oHttp.get<any>(sUrl + '/process/summary');
  };

  /**
   * Delete a process
   * @param oProcessInput
   * @returns {boolean}
   */
  deleteProcess(oProcessInput: Process) {
    let oController = this;
    let oWorkspace = this.oConstantsService.getActiveWorkspace();

    let oDialogData = new ConfirmationDialogModel("Confrim Removal", "Are you sure you want to kill this process?");

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: oDialogData
    })

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.removeProcessInServer(oProcessInput.processObjId, oWorkspace.workspaceId, oProcessInput)
      }
    })
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
    return this.oHttp.get<any>(sUrl + '/process/appstats?processorName=' + sProcessorName);
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
