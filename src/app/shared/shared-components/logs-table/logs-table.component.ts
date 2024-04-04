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

  ngOnChanges(): void {  }

  /**
   * Get the converted version of the Operation Description 
   * @param oProcess 
   * @returns string
   */
  getOperationDescription(oProcess: any) {
    return WasdiUtils.utilsConvertOperationToDescription(oProcess);
  }

  /**
   * Open the Payload Dialog
   * @param oProcess 
   */
  openPayloadDialog(oProcess: any): void {
    this.m_oDialog.open(PayloadDialogComponent, {
      height: '90vh',
      width: '100vw',
      minWidth: '100vw',
      position: {bottom: "0"},
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
