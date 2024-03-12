import { Component, Input, OnChanges } from '@angular/core';

import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { PayloadDialogComponent } from 'src/app/components/edit/payload-dialog/payload-dialog.component';
import { ProcessLogsDialogComponent } from 'src/app/components/edit/process-logs-dialog/process-logs-dialog.component';

import { MatDialog } from '@angular/material/dialog';

import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';
@Component({
  selector: 'app-logs-table',
  templateUrl: './logs-table.component.html',
  styleUrls: ['./logs-table.component.css']
})
export class LogsTableComponent implements OnChanges {
  @Input() m_aoTableData: any = [];

  constructor(
    private m_oDialog: MatDialog,
    private m_oProcessWorkspaceService: ProcessWorkspaceService
  ) { }

  ngOnChanges(): void {
    console.log(this.m_aoTableData);
  }

  /**
   * Get the converted version of the Operation Description 
   * @param oProcess 
   * @returns string
   */
  getOperationDescription(oProcess: any) {
    return WasdiUtils.utilsConvertOperationToDescription(oProcess);
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

  /**
   * Open the Payload Dialog
   * @param oProcess 
   */
  openPayloadDialog(oProcess: any): void {
    this.m_oDialog.open(PayloadDialogComponent, {
      height: '65vh',
      width: '50vw',
      data: { process: oProcess }
    })
  }

  /**
   * Open the Process Logs Dialog
   * @param oProcess 
   */
  openLogsDialog(oProcess: any): void {
    this.m_oDialog.open(ProcessLogsDialogComponent, {
      height: '80vh',
      width: '70vw',
      data: { process: oProcess }
    })
  }

  /**
   * Handle Click for delete process
   */
  deleteProcess(oProcess: any): void {
    this.m_oProcessWorkspaceService.deleteProcess(oProcess);
  }
}
