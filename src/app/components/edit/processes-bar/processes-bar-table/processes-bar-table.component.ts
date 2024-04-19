import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { PayloadDialogComponent } from 'src/app/components/edit/payload-dialog/payload-dialog.component';
import { ProcessLogsDialogComponent } from 'src/app/components/edit/process-logs-dialog/process-logs-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';

import { ProcessStatuses, ProcessTypes } from '../process-status-types';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MatDialog } from '@angular/material/dialog';

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
   * Interval function - set in ngOnInit
   */
  private m_oInterval: any;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private m_oData: any,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService
  ) { }

  ngOnInit(): void {
    this.setActiveWorkspace(this.m_oData.workspace);

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

    this.getAllProcessesLogs();

    this.m_oInterval = setInterval(() => {
      this.getLastProcessesLogs();
    }, 5000)
  }

  ngOnDestroy(): void {
    clearInterval(this.m_oInterval)
  }

  setActiveWorkspace(oActiveWorkspace) {
    this.m_oActiveWorkspace = oActiveWorkspace;
    this.m_sActiveWorkspaceId = oActiveWorkspace.workspaceId;
  }

  getLastProcessesLogs() {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_sActiveWorkspaceId) === true) {
      return false;
    }

    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(this.m_sActiveWorkspaceId, 0, 40, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (oResponse.length > 0) {
            oResponse.forEach((oElement, iIndex) => {
              this.m_aoAllProcessesLogs[iIndex] = oElement;
            })
          }
        }
      },
      error: oError => { }
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

  calculateNextListOfProcesses() {
    this.m_iFirstProcess += this.m_iNumberOfProcessForRequest;
    this.m_iLastProcess += this.m_iNumberOfProcessForRequest;
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

  generateLogFile() {
    let sText = this.makeStringLogFile();
    let oFile = this.generateFile(sText);
    return oFile;
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
    this.getAllProcessesLogs();
  }

  openPayloadDialog(oProcess) {
    this.m_oDialog.open(PayloadDialogComponent, {
      height: '90vh',
      width: '100vw',
      minWidth: '100vw',
      position: { bottom: "0" },
      data: { process: oProcess }
    })
  }


  openLogsDialog(oProcess) {
    this.m_oDialog.open(ProcessLogsDialogComponent, {
      width: '100vw',
      minWidth: '100vw',
      height: '90vh',
      position: { bottom: "0" },
      data: { process: oProcess }
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
    if (oProcessLog ==null) return false;
    if (oProcessLog.status === 'RUNNING' || oProcessLog.status === 'READY' || oProcessLog.status === 'WAITING' || oProcessLog.status === 'CREATED') return true;
    return false;
  }
}