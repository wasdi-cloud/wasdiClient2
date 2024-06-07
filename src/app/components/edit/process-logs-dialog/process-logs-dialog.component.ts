import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';


import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-process-logs-dialog',
  templateUrl: './process-logs-dialog.component.html',
  styleUrls: ['./process-logs-dialog.component.css']
})
export class ProcessLogsDialogComponent implements OnInit, OnDestroy {

  m_oProcess = this.data.process;
  m_aoLogs: any = [];
  m_aoAllLogs: any = [];
  m_sSearch: string = "";
  m_bSortReverse: boolean = true;
  m_sSortByColumn: string = "Date";
  m_iCurrentPage: number = 1;
  m_iNumberOfLogs: number = 0;
  m_iNumberOfLogsPerPage: number = 10;
  m_oTick: any = null;

  m_sTagColor: string = "";
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private m_oClipboard: Clipboard,
    private m_oDialogRef: MatDialogRef<ProcessLogsDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getLogsCount(this.m_oProcess.processObjId);
    this.m_oTick = this.startTick(this.m_oProcess.status);
    this.setTagColor(this.m_oProcess.status)
  }

  ngOnDestroy(): void {
    clearInterval(this.m_oTick);
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
    let sErrorHeader = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION");
    let sErrorRefreshMsg: string = this.m_oTranslate.instant("DIALOG_LOGS_REFRESH_ERROR");
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
        this.m_oNotificationDisplayService.openAlertDialog(sErrorRefreshMsg, sErrorHeader, 'danger');
      }
    });
    return true;
  }

  handlePagination(oEvent) {
    console.log(oEvent);
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false && oEvent.pageIndex >= 0) {
      //Page Index begins at 1: 
      this.m_iCurrentPage = oEvent.pageIndex;
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

    this.m_oProcessorService.getPaginatedLogs(oProcessId, iStartRow, iEndRow).subscribe(oResponse => {
      if (oResponse) {
        this.m_aoLogs = oResponse;
        this.m_aoLogs.reverse();
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
      let oFile = this.generateLogFile();
      let oLink = document.createElement('a');

      oLink.href = oFile;
      oLink.download = 'processorLog';
      oLink.click();
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

  startTick(sStatus: string) {
    if ((FadeoutUtils.utilsIsStrNullOrEmpty(sStatus) === true) || (sStatus !== "RUNNING")) {
      return undefined;
    }
    let oController = this;

    let oTick = setInterval(() => {
      this.getLogsCount(oController.m_oProcess.processObjId);
      sStatus = oController.m_oProcess.status;

      if (sStatus === "STOPPED " || sStatus === "ERROR" || sStatus === "DONE") {
        clearInterval(oController.m_oTick)
      }
    }, 5000);

    return oTick;
  }

  setTagColor(sProcessStatus) {
    if (sProcessStatus === 'ERROR') {
      this.m_sTagColor = 'red';
    } else if (sProcessStatus === 'STOPPED') {
      this.m_sTagColor = 'red';
      sProcessStatus = "DIALOG_PROCESSES_LOGS_STOP";

    } else if (sProcessStatus === 'DONE') {
      this.m_sTagColor = 'green';
    } else {
      sProcessStatus = 'green';
    }
  }

  setSearchString(oEvent) {
    this.m_sSearch = oEvent.event.target.value;
  }

  dismiss() {
    this.m_oDialogRef.close();
  }

  copyProcessObjId() {
    this.m_oClipboard.copy(this.m_oProcess.processObjId);
    this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD"), '', 'success-snackbar');
  }
}
