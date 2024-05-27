import { Component, Input, OnInit } from '@angular/core';

//Angular Material Imports: 
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';

//Service Imports: 
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

import { ProcessesBarTableComponent } from './processes-bar-table/processes-bar-table.component';
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
})
export class ProcessesBarComponent implements OnInit {
  @Input() m_oActiveWorkspace?: any = {};
  @Input() m_sDownloadProductName?: string = "";
  @Input() m_bShowDownloadProgress: boolean = false;

  @Input() m_bIsOpen?: boolean = false;

  m_aoProcessesRunning: any[] = [];

  m_bIsProcessRunning: boolean = false;

  m_iIsWebsocketConnected: any;
  m_iNumberOfProcesses: number = 0;
  m_iWaitingProcesses: number = 0;

  m_oLastProcesses: any = null;
  m_oProcessesBarSubscription: any;
  m_oSummary: any;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarTableComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService) {
    setTimeout(() => {
      if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProcessesRunning) && this.m_aoProcessesRunning.length != 0) {
        let iNumberOfProcesses = this.m_aoProcessesRunning.length;

        for (let iIndexProcess = 0; iIndexProcess < iNumberOfProcesses; iIndexProcess++) {
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
        let aoProcessesRunning = this.m_oProcessWorkspaceService.getProcesses().value;
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(aoProcessesRunning)) {
          this.getSummary();
          this.m_oLastProcesses = this.findLastProcess(aoProcessesRunning)
        }
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
    this.m_oNotificationDisplayService.openSnackBar(sMessage);

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
    if (this.m_bIsOpen === false) {
      this._bottomSheet.open(ProcessesBarTableComponent, {
        data: {
          workspace: this.m_oActiveWorkspace
        }
      })
    } else {
      this.m_oBottomSheetRef.dismiss();
    }
  }

  findLastProcess(aoProcessesRunning) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProcessesRunning) === true) {
      return null;
    }

    let oLastProcessRunning = null;
    let iTotalProcessesNumber = aoProcessesRunning.length;
    // Search the last one that is in running state
    for (let iIndexNewProcess = 0; iIndexNewProcess < iTotalProcessesNumber; iIndexNewProcess++) {
      if (aoProcessesRunning[iIndexNewProcess].status === "RUNNING" ||
        aoProcessesRunning[iIndexNewProcess].status === "WAITING" ||
        aoProcessesRunning[iIndexNewProcess].status === "READY") {
        oLastProcessRunning = aoProcessesRunning[iIndexNewProcess];
      }
    }
    return oLastProcessRunning;
  }
}