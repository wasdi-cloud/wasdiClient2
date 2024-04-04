import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

import { ProcessesBarComponent } from '../processes-bar.component';

import { ProcessStatuses, ProcessTypes } from '../process-status-types';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-processes-bar-table',
  templateUrl: './processes-bar-table.component.html',
  styleUrls: ['./processes-bar-table.component.css']
})
export class ProcessesBarTableComponent implements OnInit {
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
   * Processes waiting to start (Queued)
   */
  private m_iWaitingProcesses: number = 0;

  /**
   * Total number of processes
   */
  private m_iNumberOfProcesses: number = 0;

  /**
   * Is websocket connected? 0 = false; 1 = true
   */
  private m_iIsWebsocketConnected: number;

  /**
   * 
   */
  private m_oProcessesBarSubscription: any;

  public m_aoProcessStatuses = ProcessStatuses;

  public m_aoProcessTypes = ProcessTypes;

  public m_oSelectedStatus = [this.m_aoProcessStatuses[0]]

  public m_oSelectedType = [this.m_aoProcessTypes[0]]

  m_iNumberOfProcessForRequest: number = 40;
  m_iFirstProcess = 0;
  m_iLastProcess = this.m_iNumberOfProcessForRequest;

  m_aoAllProcessesLogs: Array<any> = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private m_oData: any,
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.setActiveWorkspace(this.m_oData.workspace);

    if (this.m_oActiveWorkspace.workspaceId) {
      this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_oActiveWorkspace.workspaceId);

      this.m_oProcessWorkspaceService.getProcessesRunning().subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_aoProcessesRunning = oResponse;
            console.log(this.m_aoProcessesRunning);
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
  }

  setActiveWorkspace(oActiveWorkspace) {
    this.m_oActiveWorkspace = oActiveWorkspace;
  }

  getAllProcessesLogs() {
    if (!this.m_oActiveWorkspace.workspaceId) {
      return false;
    }

    let sWorkspaceId = this.m_oActiveWorkspace.workspaceId;
    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(sWorkspaceId, this.m_iFirstProcess, this.m_iNumberOfProcessForRequest, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoAllProcessesLogs = this.m_aoAllProcessesLogs.concat(oResponse);
        console.log(this.m_aoAllProcessesLogs)
        this.calculateNextListOfProcesses();
      } else {
        // this.m_bIsLoadMoreBtnClickable = false;
      }
      if (oResponse.length < this.m_iNumberOfProcessForRequest) {
        // this.m_bIsLoadMoreBtnClickable = false;
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
}
