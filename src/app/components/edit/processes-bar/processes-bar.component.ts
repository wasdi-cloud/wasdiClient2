import { Component, Inject, Input, OnInit } from '@angular/core';

//Angular Material Imports: 
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Font Awesome Imports: 
import { faArrowDown, faArrowUp, faCircleXmark, faDatabase, faDownload, faFile, faFilter, faList, faPlug, faRefresh, faXmark } from '@fortawesome/free-solid-svg-icons';

//Service Imports: 
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { PayloadDialogComponent } from '../payload-dialog/payload-dialog.component';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProcessLogsDialogComponent } from '../process-logs-dialog/process-logs-dialog.component';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';

export interface SearchFilter {
  sStatus: string,
  sType: string,
  sDate: string,
  sName: string
}

//PROCESSES BAR (WHEN BAR IS CLOSED): 
@Component({
  selector: 'app-processes-bar',
  templateUrl: './processes-bar.component.html',
  styleUrls: ['./processes-bar.component.css']
})
export class ProcessesBarComponent implements OnInit {
  @Input() m_oActiveWorkspace?: any = {};
  @Input() m_sDownloadProductName?: string = ""; 
  @Input() m_bShowDownloadProgress: boolean = false;
  
  //Fontawesome Icon Declarations
  faArrowUp = faArrowUp;
  faPlug = faPlug;

  m_aoProcessesRunning: any[] = [];
  m_iNumberOfProcesses: number = 0;
  m_iWaitingProcesses: number = 0;
  m_oLastProcesses: any = null;
  m_iIsWebsocketConnected: any;
  m_oSummary: any;
  m_oProcessesBarSubscription: any;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService) {
    setTimeout(() => {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProcessesRunning) && this.m_aoProcessesRunning.length != 0) {
        var iNumberOfProcesses = this.m_aoProcessesRunning.length;

        for (var iIndexProcess = 0; iIndexProcess < iNumberOfProcesses; iIndexProcess++) {
          if (this.m_aoProcessesRunning[iIndexProcess].status === "RUNNING" ||
            this.m_aoProcessesRunning[iIndexProcess].status === "WAITING" ||
            this.m_aoProcessesRunning[iIndexProcess].status === "READY") {
            this.m_aoProcessesRunning[iIndexProcess].timeRunning.setSeconds(this.m_aoProcessesRunning[iIndexProcess].timeRunning.getSeconds() + 1);
          }
        }
      }

    }, 1000)
  }

  ngOnInit() {
    this.getSummary();
    this.m_oProcessesBarSubscription = this.m_oProcessWorkspaceService.updateProcessBarMsg.subscribe(oResponse => {
      if(oResponse.message === "m_aoProcessesRunning:updated" && oResponse.data === true) {
        this.getSummary(); 
      }
    })
    this.m_oRabbitStompService.getConnectionState().subscribe(oResponse => {
      this.m_iIsWebsocketConnected = oResponse;
    });
  }

  /**
   * Get summary of Processes Running and Waiting
   */
  getSummary() {
    let sMessage: string;

    //ASYNC Translation in case of refresh (reloading translations):
    this.m_oTranslate.get("MSG_SUMMARY_ERROR").subscribe(sTranslation => {
      sMessage = sTranslation;
      this.m_oProcessWorkspaceService.getSummary().subscribe({
        next: oResponse => {
          //If Response is undefined or is null:
          if (!oResponse) {
            this.m_oNotificationDisplayService.openAlertDialog( sMessage);
          } else {
            this.m_oSummary = oResponse;
            this.m_iNumberOfProcesses = oResponse.userProcessRunning;
            this.m_iWaitingProcesses = oResponse.userProcessWaiting;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog( sMessage)
        }
      });
    });
  }

  openProcessesBar(): void {
    this._bottomSheet.open(ProcessesBarContent, {
      data: {
        workspace: this.m_oActiveWorkspace
      }
    })
  }
}

//PROCESSES BAR CONTENT (WHEN BAR IS OPEN):
@Component({
  selector: 'processes-bar-content',
  templateUrl: 'processes-bar-content.html',
  styleUrls: ['./processes-bar-content.css']
})
export class ProcessesBarContent implements OnInit {
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faRefresh = faRefresh;
  faList = faList;
  faFile = faFile;
  faDatabase = faDatabase;
  faCircleX = faCircleXmark;
  //Filter inputs (form): 
  m_oFilter: any = {
    sStatus: "",
    sType: "",
    sDate: "",
    sName: ""
  };

  m_aoProcessesRunning: any[] = [];
  m_oActiveWorkspace?: any = this.data.workspace;
  m_aoAllProcessesLogs: any = [];

  constructor(
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private m_oDialog: MatDialog,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
  ) {
    console.log(this.data)
  }

  ngOnInit(): void {
    if (this.m_oActiveWorkspace.workspaceId) {
      this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
      this.m_oProcessWorkspaceService.getProcessesRunning().subscribe(aoProcesses => {
        console.log(aoProcesses);
        this.m_aoProcessesRunning = aoProcesses;
      })
    }
  }

  refreshProcesses(event: MouseEvent) {
    event.preventDefault;
    this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);
  }

  downloadProcessesFile() {
    this.m_oProcessWorkspaceService.getAllProcessesFromServer(this.m_oActiveWorkspace.workspaceId, null, null).subscribe(oResponse => {

      this.m_aoAllProcessesLogs = oResponse;
      let file = this.generateLogFile();

      let oLink = document.createElement('a');
      oLink.href = file;

      let sTimestamp = (new Date()).toISOString().replace(/[^0-9]/g, "_").slice(0, 19);

      oLink.download = "processes_" + this.m_oActiveWorkspace.name + "_" + sTimestamp;

      oLink.click();

    })
  }

  generateFile(sText) {
    let textFile = null;
    let sType = 'text/csv';

    let data = new Blob([sText], { type: sType });

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
      let sOperationType = this.m_aoAllProcessesLogs[iIndexProcessLog].operationType;
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

  generateLogFile() {
    let sText = this.makeStringLogFile();
    let oFile = this.generateFile(sText);
    return oFile;
  }

  getDuration(oProcess: any) {
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

    if (!oEndTime.getTime()) {
      oEndTime = new Date(oProcess.lastChangeDate);
    }

    if (!oEndTime.getTime()) {
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

  deleteProcess(oProcessInput: any) {
    this.m_oProcessWorkspaceService.deleteProcess(oProcessInput);
    return true;
  }

  getOperationDescription(oOperation: any) {
    return WasdiUtils.utilsConvertOperationToDescription(oOperation);
  }
  openPayloadDialog(oProcess: any) {
    let oDialogRef = this.m_oDialog.open(PayloadDialogComponent, {
      height: '65vh',
      width: '50vw',
      data: { process: oProcess }
    })
  }

  openLogsDialog(oProcess: any) {
    let oDialogRef = this.m_oDialog.open(ProcessLogsDialogComponent, {
      height: '80vh',
      width: '70vw',
      data: { process: oProcess }
    })
  }

  openProcessesModal(event: MouseEvent): void {
    const oDialogRef = this.m_oDialog.open(ProcessesDialog, {
      height: '80vh',
    });

    oDialogRef.afterClosed().subscribe(oResult => {

    })
  }

  openDialogWithFilter(event: MouseEvent) {
    const oDialogRef = this.m_oDialog.open(ProcessesDialog, {
      data: { sDate: this.m_oFilter.sDate, sName: this.m_oFilter.sName, sStatus: this.m_oFilter.sStatus, sType: this.m_oFilter.sType }
    });
  }

  resetFilter(event) {
    this.m_oFilter = {
      sStatus: "",
      sType: "",
      sDate: "",
      sName: ""
    }
    event.preventDefault();
  }


  dismiss(event: MouseEvent): void {
    this.m_oBottomSheetRef.dismiss();
    event.preventDefault();
  }

}

//PROCESSES DIALOG: 
@Component({
  selector: 'processes-dialog',
  templateUrl: 'processes-dialog.html',
  styleUrls: ['./processes-dialog.css']
})
export class ProcessesDialog {
  faFilter = faFilter
  faXmark = faXmark;
  faFile = faFile;
  faDatabase = faDatabase;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    @Inject(MAT_DIALOG_DATA) public m_oFilter: SearchFilter,
  ) {
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    if (this.m_oActiveWorkspace !== null && this.m_oActiveWorkspace !== undefined) {
      this.m_sActiveWorkspaceId = this.m_oActiveWorkspace.workspaceId;
      this.m_sActiveWorkspaceName = this.m_oActiveWorkspace.name;
    }
    if (!this.m_oFilter) {
      this.resetFilter();
    }
    this.getAllProcessesLogs();
  }

  m_bHasError: boolean = false;
  m_aoProcessesRunning: any[] = [];
  m_aoAllProcessesLogs: any[] = [];
  m_sFilterTable: string = "";
  m_bAreProcessesLoaded: boolean = false;

  m_iNumberOfProcessForRequest: number = 40;
  m_iFirstProcess = 0;
  m_iLastProcess = this.m_iNumberOfProcessForRequest;
  m_bIsLoadMoreBtnClickable: boolean = true;
  m_oActiveWorkspace: any;
  m_sActiveWorkspaceId: string;
  m_sActiveWorkspaceName: string;

  getAllProcessesLogs() {
    if (!this.m_sActiveWorkspaceId) {
      return false;
    }

    this.m_bAreProcessesLoaded = false;

    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(this.m_sActiveWorkspaceId, this.m_iFirstProcess, this.m_iLastProcess, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoAllProcessesLogs = this.m_aoAllProcessesLogs.concat(oResponse);
        this.calculateNextListOfProcesses();
      } else {
        this.m_bIsLoadMoreBtnClickable = false;
      }
      if (oResponse.length < this.m_iNumberOfProcessForRequest) {
        this.m_bIsLoadMoreBtnClickable = false;
      }

      this.m_bAreProcessesLoaded = true;
    });
    return true;
  }

  calculateNextListOfProcesses() {
    this.m_iFirstProcess += this.m_iNumberOfProcessForRequest;
    this.m_iLastProcess += this.m_iNumberOfProcessForRequest;
  }

  resetCounters() {
    this.m_iNumberOfProcessForRequest = 40;
    this.m_iFirstProcess = 0;
  }
  /**
     * Calculate and retrieve process duration in HH:MM:SS format
     * Bind on ng-binding in the WorkspaceProcessList dialog
     * @param oProcess The process Object (see ProcessWorkspaceViewModel.java)
     * @returns {string} String of duration in HH:MM:SS format
     */
  getDuration(oProcess: any) {

    if (!oProcess.operationStartDate.endsWith("Z")) {
      oProcess.operationStartDate += "Z";
    }

    // start time by server
    let oStartTime: any = new Date(oProcess.operationStartDate);
    // still running -> assign "now"
    let oEndTime: any = new Date();
    // reassign in case the process is already ended
    if (oProcess.operationEndDate) {

      if (!oProcess.operationEndDate.endsWith("Z")) {
        oProcess.operationEndDate += "Z";
      }

      oEndTime = new Date(oProcess.operationEndDate);
    }

    if (!oEndTime.getTime()) {
      oEndTime = new Date(oProcess.lastChangeDate);
    }

    if (!oEndTime.getTime()) {
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
  };

  openLogsDialog(oProcess) {
    let oDialogRef = this.m_oDialog.open(ProcessLogsDialogComponent, {
      height: '80vh',
      width: '70vw',
      data: { process: oProcess }
    })
  }

  openPayloadDialog(oProcess) {
    let oDialogRef = this.m_oDialog.open(PayloadDialogComponent, {
      height: '65vh',
      width: '50vw',
      data: { process: oProcess }
    })
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

  downloadProcessesFile() {
    this.m_oProcessWorkspaceService.getAllProcessesFromServer(this.m_sActiveWorkspaceId, null, null).subscribe(oResponse => {

      this.m_aoAllProcessesLogs = oResponse;
      let file = this.generateLogFile();

      let oLink = document.createElement('a');
      oLink.href = file;

      let sTimestamp = (new Date()).toISOString().replace(/[^0-9]/g, "_").slice(0, 19);

      oLink.download = "processes_" + this.m_sActiveWorkspaceName + "_" + sTimestamp;

      oLink.click();

    })
  }

  generateFile(sText) {
    let textFile = null;
    let sType = 'text/csv';

    let data = new Blob([sText], { type: sType });

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
      let sOperationType = this.m_aoAllProcessesLogs[iIndexProcessLog].operationType;
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

  generateLogFile() {
    let sText = this.makeStringLogFile();
    let oFile = this.generateFile(sText);
    return oFile;
  }

  deleteProcess(oProcessInput) {
    this.m_oProcessWorkspaceService.deleteProcess(oProcessInput);
    return true;
  }

  getOperationDescription(oOperation) {
    return //utilsConvertOperationToDescription(oOperation);
  }

  applyFilters() {
    this.resetCounters();
    this.m_aoAllProcessesLogs = [];
    this.getAllProcessesLogs();
  }

  resetFilter() {
    this.m_oFilter = {
      sStatus: "",
      sType: "",
      sDate: "",
      sName: ""
    }
  }


  dismiss(event: MouseEvent): void {
    this.m_oDialog.closeAll();
    event.preventDefault();
  }

}