import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';

//Angular Material Imports: 
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Font Awesome Imports: 
import { faArrowDown, faArrowUp, faBars, faCircleXmark, faDatabase, faDownload, faFile, faFilter, faList, faListSquares, faPlug, faPlugCircleBolt, faRefresh, faXmark } from '@fortawesome/free-solid-svg-icons';

//Service Imports: 
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { PayloadDialogComponent } from '../payload-dialog/payload-dialog.component';
import { ProcessLogsDialogComponent } from '../process-logs-dialog/process-logs-dialog.component';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessesDialog } from './processes-dialog/processes-dialog.component';
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
  styleUrls: ['./processes-bar.component.css'],
  host: { "class": "flex-fill" }
})
export class ProcessesBarComponent implements OnInit {
  @Input() m_oActiveWorkspace?: any = {};
  @Input() m_sDownloadProductName?: string = "";
  @Input() m_bShowDownloadProgress: boolean = false;

  //Fontawesome Icon Declarations
  faArrowUp = faArrowUp;
  faBars = faListSquares;
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
    private m_oDialog: MatDialog,
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
      if (oResponse.message === "m_aoProcessesRunning:updated" && oResponse.data === true) {
        this.getSummary();
      }
    })
    this.m_oRabbitStompService.getConnectionState().subscribe(oResponse => {
      this.m_iIsWebsocketConnected = oResponse;
    });
  }

  /**
   * Handler for messages that add a new product to the Workspace
   * @param oMessage 
   */
  receivedNewProductMessage(oMessage: any) {
    let sMessage: string = this.m_oTranslate.instant("MSG_EDIT_PRODUCT_ADDED")
    this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close");

    //Emit the message payload and file name to parent: 

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
            this.m_oNotificationDisplayService.openAlertDialog(sMessage);
          } else {
            this.m_oSummary = oResponse;
            this.m_iNumberOfProcesses = oResponse.userProcessRunning;
            this.m_iWaitingProcesses = oResponse.userProcessWaiting;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sMessage)
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

  /**
   * Open Processes Dialog
   */
  openProcessesDialog(): void {
    this.m_oDialog.open(ProcessesDialog)
  }
}

//PROCESSES BAR CONTENT (WHEN BAR IS OPEN):
@Component({
  selector: 'processes-bar-content',
  templateUrl: 'processes-bar-content.html',
  styleUrls: ['./processes-bar-content.css'],
})
export class ProcessesBarContent implements OnInit {
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faRefresh = faRefresh;
  faList = faList;
  faFile = faFile;
  faDatabase = faDatabase;
  faCircleX = faCircleXmark;
  faPlug = faPlug; 
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
  m_iWaitingProcesses: number = 0;
  m_iNumberOfProcesses: number = 0;
  m_iIsWebsocketConnected: number;
  m_oProcessesBarSubscription: any;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    if (this.m_oActiveWorkspace.workspaceId) {

      this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);

      this.m_oProcessWorkspaceService.getProcessesRunning().subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_aoProcessesRunning = oResponse;
          } else {
            this.m_oNotificationDisplayService.openAlertDialog("Error in getting running processes");
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Error in getting running processes");
        }
      });
    }
    this.m_oRabbitStompService.getConnectionState().subscribe(oResponse => {
      this.m_iIsWebsocketConnected = oResponse;
    });
    this.getSummary();
    this.m_oProcessesBarSubscription = this.m_oProcessWorkspaceService.updateProcessBarMsg.subscribe(oResponse => {
      if (oResponse.message === "m_aoProcessesRunning:updated" && oResponse.data === true) {
        this.getSummary();
      }
    })
    this.m_oRabbitStompService.getConnectionState().subscribe(oResponse => {
      this.m_iIsWebsocketConnected = oResponse;
    });
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

  openProcessesDialog(): void {
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

  getSummary() {
    let sMessage: string;

    //ASYNC Translation in case of refresh (reloading translations):
    this.m_oTranslate.get("MSG_SUMMARY_ERROR").subscribe(sTranslation => {
      sMessage = sTranslation;
      this.m_oProcessWorkspaceService.getSummary().subscribe({
        next: oResponse => {
          //If Response is undefined or is null:
          if (!oResponse) {
            this.m_oNotificationDisplayService.openAlertDialog(sMessage);
          } else {
            this.m_iNumberOfProcesses = oResponse.userProcessRunning;
            this.m_iWaitingProcesses = oResponse.userProcessWaiting;
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sMessage)
        }
      });
    });
  }

  dismiss(event: MouseEvent): void {
    this.m_oBottomSheetRef.dismiss();
    event.preventDefault();
  }

}
