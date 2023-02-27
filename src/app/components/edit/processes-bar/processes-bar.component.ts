import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { faArrowDown, faArrowUp, faDownload, faFilter, faList, faRefresh, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-processes-bar',
  templateUrl: './processes-bar.component.html',
  styleUrls: ['./processes-bar.component.css']
})
export class ProcessesBarComponent {
  //Fontawesome Icon Declarations
  faArrowUp = faArrowUp;

  @Input() m_aoProcessesRunning: any[] = [];
  m_iNumberOfProcesses: number = 0;
  m_iWaitingProcesses: number = 0;
  m_oLastProcesses: any = null;

  constructor(private _bottomSheet: MatBottomSheet) { }

  openProcessesBar(): void {
    this._bottomSheet.open(ProcessesBarContent, {
      data: this.m_aoProcessesRunning
    })
  }
}

@Component({
  selector: 'processes-bar-content',
  templateUrl: 'processes-bar-content.html',
  styleUrls: ['./processes-bar-content.css']
})
export class ProcessesBarContent {
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faRefresh = faRefresh;
  faList = faList;

  //Filter inputs (form): 
  m_oFilter: any = {
    sStatus: "Status...",
    sType: "Type...",
    sDate: "",
    sName: ""

  };

  m_aoProcessesRunning: any[] = this.data;

  constructor(
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private m_oDialog: MatDialog
  ) { }

  dismiss(event: MouseEvent): void {
    this.m_oBottomSheetRef.dismiss();
    event.preventDefault();
  }

  openProcessesModal(event: MouseEvent): void {
    const oDialogRef = this.m_oDialog.open(ProcessesDialog, {
      height: '80vh',
    });

    oDialogRef.afterClosed().subscribe(oResult => {
      console.log(oResult)
    })
  }
  
  formTest() {
    console.log(this.m_oFilter)
  }
}

@Component({
  selector: 'processes-dialog',
  templateUrl: 'processes-dialog.html',
  styleUrls: ['./processes-dialog.css']
})
export class ProcessesDialog {
  faFilter = faFilter
  faXmark = faXmark;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessWorkspaceService: ProcessWorkspaceServiceService
  ) {
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    if (this.m_oActiveWorkspace !== null && this.m_oActiveWorkspace !== undefined) {
      this.m_sActiveWorkspaceId = this.m_oActiveWorkspace.workspaceId;
      this.m_sActiveWorkspaceName = this.m_oActiveWorkspace.name;
    }

    this.getAllProcessesLogs();
  }

  m_bHasError: boolean = false;
  m_aoProcessesLogs: any[] = [];
  m_aoAllProcessesLogs: any[] = [];
  m_sFilterTable: string = "";
  m_bAreProcessesLoaded: boolean = false;

  //Filter inputs (form): 
  m_oFilter: any = {
    sStatus: "Status...",
    sType: "Type...",
    sDate: "",
    sName: ""

  };

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

    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(this.m_sActiveWorkspaceId, this.m_iFirstProcess, this.m_iLastProcess, this.m_oFilter.m_sStatus, this.m_oFilter.m_sType, this.m_oFilter.m_sDate, this.m_oFilter.m_sName).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoProcessesLogs = this.m_aoProcessesLogs.concat(oResponse);
        console.log(this.m_aoProcessesLogs)
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
    console.log(this.m_iFirstProcess)
    this.m_iLastProcess += this.m_iNumberOfProcessForRequest;
    console.log(this.m_iLastProcess)
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
  getProcessDuration(oProcess: any) {

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


    //var oDate = new Date(1970, 0, 1);
    //oDate.setSeconds(0 + iSecondsTimeSpan);

    //return oDate;
    return sTimeSpan;
  };

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
      if (oResponse !== null) {
        if (oResponse !== undefined) {
          this.m_aoProcessesLogs = oResponse;

          let file = this.generateLogFile();

          let oLink = document.createElement('a');
          oLink.href = file;

          let sTimestamp = (new Date()).toISOString().replace(/[^0-9]/g, "_").slice(0, 19);

          oLink.download = "processes_" + this.m_sActiveWorkspaceName + "_" + sTimestamp;

          oLink.click();
        }
      }
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

  formTest() {
    console.log(this.m_oFilter)
  }

}