import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

import { ProcessesBarComponent } from '../processes-bar.component';

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

    // this.m_bAreProcessesLoaded = false;

    this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(sWorkspaceId, this.m_iFirstProcess, this.m_iLastProcess, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoAllProcessesLogs = this.m_aoAllProcessesLogs.concat(oResponse);
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

}
