import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faDownload, faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

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
  m_aoAllLogs: any = [];
  m_sSearch: string = "";
  m_bSortReverse: boolean = true;
  m_sSortByColumn: string = "Date";
  m_iCurrentPage: number = 1;
  m_iNumberOfLogs: number = 0;
  m_iNumberOfLogsPerPage: number = 10;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oAuthService: AuthService,
    private m_oCatalogService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ProcessLogsDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
  ) {
    this.getLogsCount(this.m_oProcess.processObjId);
  }

  getLogsCountANDLogsCallback(oResponse: any) {
    if (!oResponse) {
      return false;
    }
    console.log(oResponse);
    this.m_iNumberOfLogs = oResponse;

    let iFirstRow = this.m_iNumberOfLogs - (this.m_iCurrentPage * this.m_iNumberOfLogsPerPage);
    let iLastRow = iFirstRow + this.m_iNumberOfLogsPerPage - 1;
    if (iFirstRow < 0) {
      iFirstRow = 0;
    }
    console.log(iLastRow, iFirstRow);
    this.getPaginatedLogs(this.m_oProcess.processObjId, iFirstRow, iLastRow);
    return true;
  }

  //Get the number of Logs for this processor
  getLogsCount(oProcessId: any) {
    let sErrorMsg: string = 'GURU MEDITATION<br>ERROR READING PROCESSOR LOGS';
    let sErrorRefreshMsg: string = 'GURU MEDITATION<br>ERROR REFRESHING PROCESSOR STATUS';
    if (!oProcessId) {
      return false;
    }

    this.m_oProcessorService.getLogsCount(oProcessId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.getLogsCountANDLogsCallback(oResponse);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorRefreshMsg);
      }
    });
    return true;
  }

  handlePagination(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false && oEvent.pageIndex >= 0) {
      //Page Index begins at 0: 
      this.m_iCurrentPage = oEvent.pageIndex + 1;
      //Get the Logs Count
      this.getLogsCount(this.m_oProcess.processObjId);
    }

  }

  getPaginatedLogs(oProcessId, iStartRow: number | string, iEndRow: number | string) {
    if (!oProcessId) {
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(iStartRow) === true) {
      iStartRow = "";
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(iEndRow) === true) {
      iEndRow = "";
    }

    console.log(iStartRow, iEndRow);

    this.m_oProcessorService.getPaginatedLogs(oProcessId, iStartRow, iEndRow).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoLogs = oResponse;
        this.m_aoLogs.reverse();
        console.log(this.m_aoLogs)
      }
    });
    return true;
  }

  refreshLogs() {
    this.getLogsCount(this.m_oProcess.processObjId);
  }

  downloadLogFile() {
    this.m_oProcessorService.getPaginatedLogs(this.m_oProcess.processObjId, null, null).subscribe(oResponse => {
      if (!oResponse) {
        return false;
      }
      this.m_aoAllLogs = oResponse;
      console.log(this.m_aoAllLogs);
      // let oFile = this.generateLogFile();
      // let oLink = document.createElement('a');

      // console.log(oFile)

      // oLink.href = oFile;
      // oLink.download = 'processorLog';
      // oLink.click();
      return true;
    })
  }

  generateLogFile() {
    let sText = this.makeStringLogFile();
    let oFile = this.generateFile(sText);

    return oFile;
  }

  generateFile(sText: string) {
    let sType = 'text/plain';
    let textFile = null;
    let data = new Blob([sText], { type: sType });
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);
    return textFile;
  }

  makeStringLogFile() {
    if (!this.m_aoAllLogs) {
      return null;
    }
    let iNumberOfProcessesLogs = this.m_aoAllLogs.length;
    let sText = "";
    for (let i = 0; i < iNumberOfProcessesLogs; i++) {
      let sLogDate = this.m_aoAllLogs[i].logDate;
      let sLogRow = this.m_aoAllLogs[i].logRow;

      sText += sLogDate + "; " + sLogRow + "\r\n";
    }

    return sText;
  }

  dismiss() {
    this.m_oDialogRef.close();
  }
}
