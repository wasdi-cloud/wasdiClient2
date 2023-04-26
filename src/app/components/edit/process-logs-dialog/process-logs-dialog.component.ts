import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { faDownload, faX } from '@fortawesome/free-solid-svg-icons';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-process-logs-dialog',
  templateUrl: './process-logs-dialog.component.html',
  styleUrls: ['./process-logs-dialog.component.css']
})
export class ProcessLogsDialogComponent {
  //Font Awesome Imports
  faXmark = faX;
  faDownload = faDownload;

  //Member values
  m_oProcess = this.data.process;
  m_aoLogs: any = [];
  m_aoAllLogs: any[] = [];
  m_sSearch: string = "";
  m_bSortReverse: boolean = true;
  m_sSortByColumn: string = "Date";
  m_iCurrentPage: number = 1;
  m_iNumberOfLogs: number = 0;
  m_iNumberOfLogsPerPage: number = 10;

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oProcessorService: ProcessorService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.getLogsCount(this.m_oProcess.processObjId);
  }

  getLogsCountANDLogsCallback(oResponse: any) {
    if (!oResponse) {
      return false;
    }
    this.m_iNumberOfLogs = oResponse;

    let iFirstRow = this.m_iNumberOfLogs - (this.m_iCurrentPage * this.m_iNumberOfLogsPerPage);
    let iLastRow = iFirstRow + this.m_iNumberOfLogsPerPage - 1;
    if (iFirstRow < 0) {
      iFirstRow = 0;
    }

    this.getPaginatedLogs(this.m_oProcess.processObjId, iFirstRow, iLastRow);
    return true;
  }

  //Get the number of Logs for this processor
  getLogsCount(oProcessId: any) {
    if (!oProcessId) {
      return false;
    }

    this.m_oProcessorService.getLogsCount(oProcessId).subscribe(oResponse => {
      this.getLogsCountANDLogsCallback(oResponse);
    })
    return true;
  }

  getPaginatedLogs(oProcessId, iStartRow: number | string, iEndRow: number | string) {
    if (!oProcessId) {
      return false;
    }
    if (!iStartRow) {
      iStartRow = "";
    }
    if (!iEndRow) {
      iEndRow = "";
    }

    this.m_oProcessorService.getPaginatedLogs(oProcessId, iStartRow, iEndRow).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoLogs = oResponse;
        console.log(this.m_aoLogs);
      }
    });
    return true;
  }

  dismiss() {
    this.m_oDialog.closeAll();
  }
}
