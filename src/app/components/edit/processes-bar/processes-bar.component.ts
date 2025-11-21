import { Component, Input, OnInit, OnDestroy } from '@angular/core';

//Angular Material Imports: 
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

//Service Imports: 
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

import { ProcessesBarTableComponent } from './processes-bar-table/processes-bar-table.component';
//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { Subscription } from 'rxjs';

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
export class ProcessesBarComponent implements OnInit, OnDestroy {
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
  m_oSummary: any;

  m_sWorkspaceId: string = "";
  m_oUpdateInterval: any;

  m_bSuspendTimer: boolean;

  m_bFilterSummaryOnUser: boolean = false;
  m_bFilterSummaryOnWorkspace: boolean = false;

  constructor(
    private m_oBottomSheet: MatBottomSheet,
    private m_oBottomSheetRef: MatBottomSheetRef<ProcessesBarTableComponent>,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService) {
      
      this.m_oUpdateInterval = setInterval(() => {
        if (!this.m_bSuspendTimer) {
          this.getSummary();
          let aoProcessesRunning = this.m_oProcessWorkspaceService.getProcesses().value;          
          this.m_oLastProcesses = this.findLastProcess(aoProcessesRunning)
        }
        
      }, 5000)
  }

  ngOnInit() {

    this.getSummary();

    this.m_oRabbitStompService.getConnectionState().subscribe(oResponse => {
      this.m_iIsWebsocketConnected = oResponse;
    });
  }

  ngOnDestroy(): void {
    if (this.m_oUpdateInterval) {
      clearInterval(this.m_oUpdateInterval);
    }
  }

  /**
   * Handler for messages that add a new product to the Workspace
   * @param oMessage 
   */
  receivedNewProductMessage(oMessage: any) {
    let sMessage: string = this.m_oTranslate.instant("MSG_EDIT_PRODUCT_ADDED")
    this.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'generic');
  }

  /**
   * Get summary of Processes Running and Waiting
   */
  getSummary() {
    let sMessage: string;

    if (this.m_oConstantsService.getActiveWorkspace().workspaceId) {
      //ASYNC Translation in case of refresh (reloading translations):
      this.m_oTranslate.get("MSG_SUMMARY_ERROR").subscribe(sTranslation => {
        sMessage = sTranslation;
        let sWorkspaceId = null;
        if (this.m_bFilterSummaryOnWorkspace) {
          sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
        }
        this.m_oProcessWorkspaceService.getSummary(sWorkspaceId).subscribe({
          next: oResponse => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
              this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert');
            } 
            else {
              this.m_oSummary = oResponse;
              if (this.m_bFilterSummaryOnUser) {
                this.m_iNumberOfProcesses = oResponse.userProcessRunning;
                this.m_iWaitingProcesses = oResponse.userProcessWaiting;
              }
              else {
                this.m_iNumberOfProcesses = oResponse.allProcessRunning;
                this.m_iWaitingProcesses = oResponse.allProcessWaiting;
              }
            }
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert')
          }
        });
      });
    }
  }

  openProcessesBar(): void {
    if (this.m_bIsOpen === false) {
      this.m_bSuspendTimer = true;

      let oOpenedBarTableRef =this.m_oBottomSheet.open(ProcessesBarTableComponent, {
        data: {
          workspace: this.m_oActiveWorkspace
        }
      });

      oOpenedBarTableRef.afterDismissed().subscribe(() => {
        this.m_bSuspendTimer = false;
      })
    } 
    else {
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

  onFilterUserChange(oEvent: any) {
    this.m_bFilterSummaryOnUser = oEvent.target.checked;
    this.getSummary();
  }

  onFilterWorkspaceChange(oEvent: any) {
    this.m_bFilterSummaryOnWorkspace = oEvent.target.checked;
    this.getSummary();
  }
}