import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {PayloadDialogComponent} from 'src/app/components/edit/payload-dialog/payload-dialog.component';
import {ProcessLogsDialogComponent} from 'src/app/components/edit/process-logs-dialog/process-logs-dialog.component';
import {NotificationDisplayService} from 'src/app/services/notification-display.service';
import {ProcessWorkspaceService} from 'src/app/services/api/process-workspace.service';

import {ProcessStatuses, ProcessTypes} from '../process-status-types';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import { ProcessesBarComponent } from '../processes-bar.component';

@Component({
  selector: 'app-processes-bar-table',
  templateUrl: './processes-bar-table.component.html',
  styleUrls: ['./processes-bar-table.component.css']
})
export class ProcessesBarTableComponent implements OnInit, OnDestroy {
  /**
   * Filter Inputs from header
   */
  m_oFilter: any = {
    sStatus: "",
    sType: "",
    sDate: "",
    sName: ""
  }

  /**
   * Processes retrieved from the server
   */
  private m_aoProcessesRunning: Array<any> = [];

  /**
   * Currently active workspace (optional - if the process bar is on the search page with no active workspace)
   */
  private m_oActiveWorkspace?: any = null;


  /**
   * Statuses of the Processes (e.g., 'DONE', 'RUNNING', etc)
   */
  public m_aoProcessStatuses = ProcessStatuses;

  /**
   * Process Types
   */
  public m_aoProcessTypes = ProcessTypes;

  /**
   * Default Selected Status for the Statuses Dropdown
   */
  public m_oSelectedStatus = [this.m_aoProcessStatuses[0]]

  /**
   * Default Selected Type for the Type Dropdown
   */
  public m_oSelectedType = [this.m_aoProcessTypes[0]]

  /**
   * Selected Workspace ID
   */
  private m_sActiveWorkspaceId: string = null;


  /**
   * Number of Processes for the get all Processes Request
   */
  private m_iNumberOfProcessForRequest: number = 40;

  /**
   * Integer of the first process to be requested
   */
  private m_iFirstProcess = 0;

  private m_iLastProcess = this.m_iNumberOfProcessForRequest;

  public m_aoAllProcessesLogs: Array<any> = [];

  public m_bIsLoadMoreBtnClickable: boolean = true;

  /**
   * Flag to check if we are getting the filtered process logs or the unfiltered logs
   */
  private m_bGetFilteredLog: boolean = false;

  /**
   * Interval function - set in ngOnInit
   */
  private m_oInterval: any;

  @ViewChild("processBar")
  private m_oProcessBar: ProcessesBarComponent;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private m_oData: any,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oTranslate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.setActiveWorkspace(this.m_oData.workspace);

    if (this.m_oActiveWorkspace.workspaceId) {
      let sErrorMsg: string = this.m_oTranslate.instant("PROCESSES_BAR_RUNNING_PROCESSES_ERROR")
      this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);

      this.m_oProcessWorkspaceService.getProcessesRunning().subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_aoProcessesRunning = oResponse;
          } else {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
        }
      });
    }

    this.getAllProcessesLogs();

    this.m_oInterval = setInterval(() => {
      this.getLastProcessesLogs();
    }, 5000)
  }

  ngOnDestroy(): void {
    clearInterval(this.m_oInterval);

    if (this.m_oProcessBar) {
      this.m_oProcessBar.ngOnDestroy();
    }
  }

  setActiveWorkspace(oActiveWorkspace) {
    this.m_oActiveWorkspace = oActiveWorkspace;
    this.m_sActiveWorkspaceId = oActiveWorkspace.workspaceId;
  }

  getLastProcessesLogs() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_sActiveWorkspaceId) === true) {
      return false;
    }

    //Placeholder values to pass to getFilteredProcessesFromWorkspace function
    let sName: string = "";
    let sStatus: string = "";
    let sType: string = "";
    let sDate: string = ""

    //If the filters have been set, set the placeholder values;
    if (this.m_bGetFilteredLog) {
      sName = this.m_oFilter.sName;
      sStatus = this.m_oFilter.sStatus;
      sType = this.m_oFilter.sType;
      sDate = this.m_oFilter.sDate;
    }

    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(this.m_sActiveWorkspaceId, 0, 40, sStatus, sType, sDate, sName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (oResponse.length > 0) {
            // for (const oResponseElement of oResponse) {
            //   if (oResponseElement.operationType == "DOWNLOAD") {
            //     oResponseElement.operationType = "FETCH"
            //   }
            // }
            oResponse.forEach((oElement, iIndex) => {
              this.m_aoAllProcessesLogs[iIndex] = oElement;
            })
          }
        }
      },
      error: oError => {
      }
    })
    return true;
  }

  getAllProcessesLogs() {
    if (!this.m_oActiveWorkspace.workspaceId) {
      return false;
    }

    let sWorkspaceId = this.m_oActiveWorkspace.workspaceId;
    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(sWorkspaceId, this.m_iFirstProcess, this.m_iLastProcess, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe(oResponse => {
      if (oResponse) {
        // //this replace the word download by fetch in the process coming for the server and also change the processes.payload the same way
        // for (let oResponseElement of oResponse) {
        //   oResponseElement = this.changeDownloadToFetch(oResponseElement);
        // }

        this.m_aoAllProcessesLogs = this.m_aoAllProcessesLogs.concat(oResponse);
        this.calculateNextListOfProcesses();
      } else {
        this.m_bIsLoadMoreBtnClickable = false;
      }
      if (oResponse.length < this.m_iNumberOfProcessForRequest) {
        this.m_bIsLoadMoreBtnClickable = false;
      }

      // this.m_bAreProcessesLoaded = true;
    });
    return true;
  }

  private changeDownloadToFetch(oResponseElement) {
    const re = /DOWNLOAD/gi;

    if (oResponseElement.payload) {
      oResponseElement.payload = oResponseElement.payload.replace(re, "FETCH");
    }
    if (oResponseElement.operationType == "DOWNLOAD") {
      oResponseElement.operationType = "FETCH"
    }

    return oResponseElement;
  }

  calculateNextListOfProcesses() {
    this.m_iFirstProcess += this.m_iNumberOfProcessForRequest;
    this.m_iLastProcess += this.m_iNumberOfProcessForRequest;
  }

  downloadProcessesFile() {
    this.m_oProcessWorkspaceService.getAllProcessesFromServer(this.m_oActiveWorkspace.workspaceId, null, null).subscribe(oResponse => {
      //this replace the word download by fetch in the process coming for the server and also change the processes.payload the same way

      // for (let oResponseElement of oResponse) {
      //   oResponseElement = this.changeDownloadToFetch(oResponseElement);
      // }
      this.m_aoAllProcessesLogs = oResponse;
      let file = this.generateLogFile();

      let oLink = document.createElement('a');
      oLink.href = file;

      let sTimestamp = (new Date()).toISOString().replace(/[^0-9]/g, "_").slice(0, 19);

      oLink.download = "processes_" + this.m_oActiveWorkspace.name + "_" + sTimestamp + ".csv";

      oLink.click();

    })
  }

  generateLogFile() {
    let sText = this.makeStringLogFile();
    let oFile = this.generateFile(sText);
    return oFile;
  }

  generateFile(sText) {
    let textFile = null;
    let sType = 'text/csv';

    let data = new Blob([sText], {type: sType});

    textFile = window.URL.createObjectURL(data);

    return textFile;
  }

  makeStringLogFile() {
    if (!this.m_aoAllProcessesLogs) {
      return null;
    }
    let iNumberOfProcessesLogs: number = this.m_aoAllProcessesLogs.length;
    let sText: string = "";

    sText += "Id,Product Name,Operation Type,User,Status,Progress,Operation date,Operation end date,File size" + "\r\n";

    for (let iIndexProcessLog = 0; iIndexProcessLog < iNumberOfProcessesLogs; iIndexProcessLog++) {
      let sOperationDate = this.m_aoAllProcessesLogs[iIndexProcessLog].operationStartDate;
      let sFileSize = this.m_aoAllProcessesLogs[iIndexProcessLog].fileSize;
      let sOperationEndDate = this.m_aoAllProcessesLogs[iIndexProcessLog].operationEndDate;
      // let sOperationType = this.m_aoAllProcessesLogs[iIndexProcessLog].operationType == "DOWNLOAD" ? "FETCH" : this.m_aoAllProcessesLogs[iIndexProcessLog].operationType;
      let sOperationType = this.m_aoAllProcessesLogs[iIndexProcessLog].operationType
      let sPid = this.m_aoAllProcessesLogs[iIndexProcessLog].pid;
      let sProductName = this.m_aoAllProcessesLogs[iIndexProcessLog].productName;
      let sProgressPerc = this.m_aoAllProcessesLogs[iIndexProcessLog].progressPerc;
      let sStatus = this.m_aoAllProcessesLogs[iIndexProcessLog].status;
      let sUserId = this.m_aoAllProcessesLogs[iIndexProcessLog].userId;

      sText += sPid + "," + sProductName + "," + sOperationType +
        "," + sUserId + "," + sStatus + "," + sProgressPerc + "%" +
        "," + sOperationDate + "," + sOperationEndDate + "," + sFileSize + "\r\n";
    }
    return sText;
  }

  catchFilterChange(oEvent, sFilterName) {
    if (sFilterName === 'name') {
      this.m_oFilter.sName = oEvent.event.target.value;
    } else if (sFilterName === 'type') {
      this.m_oFilter.sType = oEvent.value.value;
    } else {
      this.m_oFilter.sStatus = oEvent.value.value;
    }
  }

  applyFilters() {
    this.resetCounters();
    this.m_aoAllProcessesLogs = [];
    this.m_bGetFilteredLog = true;
    this.getAllProcessesLogs();
  }

  resetCounters() {
    this.m_iNumberOfProcessForRequest = 40;
    this.m_iFirstProcess = 0;
  }

  clearFilters() {
    this.m_aoAllProcessesLogs = [];
    this.m_oFilter.sName = "";
    this.m_oFilter.sDate = "";
    this.m_oFilter.sStatus = "";
    this.m_oFilter.sType = "";
    this.m_oSelectedStatus = [];
    this.m_oSelectedType = [];
    this.resetCounters();
    this.m_bGetFilteredLog = false;
    this.getAllProcessesLogs();
  }

  openPayloadDialog(oProcess) {
    this.m_oDialog.open(PayloadDialogComponent, {
      height: '90vh',
      width: '100vw',
      minWidth: '100vw',
      position: {bottom: "0"},
      data: {process: oProcess}
    })
  }


  openLogsDialog(oProcess) {
    this.m_oDialog.open(ProcessLogsDialogComponent, {
      width: '100vw',
      minWidth: '100vw',
      height: '90vh',
      position: {bottom: "0"},
      data: {process: oProcess}
    })
  }

  deleteProcess(oProcess) {
    this.m_oProcessWorkspaceService.deleteProcess(oProcess);
  }

  // loadOnScroll(oEvent) {
  //   if (oEvent.target.scrollHeight < oEvent.target.scrollTop + oEvent.target.offsetHeight) {
  //     this.getAllProcessesLogs();
  //   }
  // }

  showKillButton(oProcessLog) {
    if (oProcessLog == null) return false;
    if (oProcessLog.status === 'RUNNING' || oProcessLog.status === 'READY' || oProcessLog.status === 'WAITING' || oProcessLog.status === 'CREATED') return true;
    return false;
  }

  renderTwoDigitNumber(iNumber: number) {
    let sNumber = "00";

    if (iNumber > 0) {
      if (iNumber < 10) {
        sNumber = "0" + String(iNumber);
      } else {
        sNumber = String(iNumber);
      }
    }

    return sNumber;
  }


  getDuration(oProcess): string {
    let sStartDate = oProcess.operationStartDate;
    if (!oProcess.operationStartDate.endsWith("Z")) {
      sStartDate += "Z";
    }

    // start time by server
    let oStartTime: any = new Date(sStartDate);
    // still running -> assign "now"
    let oEndTime: any = new Date();
    // reassign in case the process is already ended
    if (oProcess.operationEndDate) {

      if (!oProcess.operationEndDate.endsWith("Z")) {
        oProcess.operationEndDate += "Z";
      }

      oEndTime = new Date(oProcess.operationEndDate);
    }

    if (FadeoutUtils.utilsIsValidDate(oEndTime) === false) {
      oEndTime = new Date(oProcess.lastChangeDate);
    }

    if (FadeoutUtils.utilsIsValidDate(oEndTime) === false) {
      oEndTime = new Date();
    }


    //pick time
    let iMilliseconds = Math.abs(oEndTime - oStartTime);

    //approximate result
    let iSecondsTimeSpan = Math.ceil(iMilliseconds / 1000);

    if (!iSecondsTimeSpan || iSecondsTimeSpan < 0) {
      iSecondsTimeSpan = 0;
    }

    // Calculate number of hours
    let iHours = Math.trunc(iSecondsTimeSpan / (3600));

    let iMinutesReminder = iSecondsTimeSpan - (iHours * 3600);
    let iMinutes = Math.trunc(iMinutesReminder / 60);
    let iSeconds = iMinutesReminder - (iMinutes * 60);

    let sTimeSpan = this.renderTwoDigitNumber(iHours) + ":" + this.renderTwoDigitNumber(iMinutes) + ":" + this.renderTwoDigitNumber(iSeconds);

    // var oDate = new Date(1970, 0, 1);
    // oDate.setSeconds(0 + iSecondsTimeSpan);

    // return oDate;
    return sTimeSpan;
  }

}
