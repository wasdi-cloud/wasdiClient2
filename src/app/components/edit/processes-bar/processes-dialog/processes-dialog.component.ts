import { Component, Inject, OnDestroy } from '@angular/core';

//Angular Material Imports: 
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Font Awesome Imports: 
import { faDatabase, faFile, faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';

//Service Imports: 
import { ConstantsService } from 'src/app/services/constants.service';
import { PayloadDialogComponent } from '../../payload-dialog/payload-dialog.component';
import { ProcessLogsDialogComponent } from '../../process-logs-dialog/process-logs-dialog.component';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';

export interface SearchFilter {
    sStatus: string,
    sType: string,
    sDate: string,
    sName: string
}
@Component({
    selector: 'processes-dialog',
    templateUrl: 'processes-dialog.html',
    styleUrls: ['./processes-dialog.css']
})
export class ProcessesDialog implements OnDestroy {
    faFilter = faFilter
    faXmark = faXmark;
    faFile = faFile;
    faDatabase = faDatabase;

    m_bHasError: boolean = false;
    m_aoProcessesRunning: any[] = [];
    m_aoAllProcessesLogs: any[] = [];
    m_sFilterTable: string = "";
    m_bAreProcessesLoaded: boolean = false;

    m_iNumberOfProcessForRequest: number = 40;
    m_iFirstProcess = 0;
    m_iLastProcess = this.m_iNumberOfProcessForRequest;
    m_bIsLoadMoreBtnClickable: boolean = true;
    m_oActiveWorkspace: any;
    m_sActiveWorkspaceId: string;
    m_sActiveWorkspaceName: string;

    m_oInterval: any;

    constructor(
        private m_oConstantsService: ConstantsService,
        private m_oDialog: MatDialog,
        private m_oProcessWorkspaceService: ProcessWorkspaceService,
        @Inject(MAT_DIALOG_DATA) public m_oFilter: SearchFilter,
    ) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oFilter)) {
            this.m_oFilter = {} as SearchFilter;
            this.m_oFilter.sDate = '';
            this.m_oFilter.sName = '';
        }
        this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
        if (this.m_oActiveWorkspace !== null && this.m_oActiveWorkspace !== undefined) {
            this.m_sActiveWorkspaceId = this.m_oActiveWorkspace.workspaceId;
            this.m_sActiveWorkspaceName = this.m_oActiveWorkspace.name;
        }
        if (!this.m_oFilter) {
            this.resetFilter();
        }
        this.getAllProcessesLogs();

        this.m_oInterval = setInterval(() => {
            this.getLastProcessesLogs();
        }, 5000)
    }

    ngOnDestroy() {
        clearInterval(this.m_oInterval);
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
        if (!this.m_sActiveWorkspaceId) {
            return false;
        }

        this.m_bAreProcessesLoaded = false;

        this.m_oProcessWorkspaceService.getFilteredProcessesFromServer(this.m_sActiveWorkspaceId, this.m_iFirstProcess, this.m_iLastProcess, this.m_oFilter.sStatus, this.m_oFilter.sType, this.m_oFilter.sDate, this.m_oFilter.sName).subscribe(oResponse => {
            if (oResponse) {
                this.m_aoAllProcessesLogs = this.m_aoAllProcessesLogs.concat(oResponse);
                this.calculateNextListOfProcesses();
            } else {
                this.m_bIsLoadMoreBtnClickable = false;
            }
            if (oResponse.length < this.m_iNumberOfProcessForRequest) {
                this.m_bIsLoadMoreBtnClickable = false;
            }

            this.m_bAreProcessesLoaded = true;
        });
        return true;
    }

    calculateNextListOfProcesses() {
        this.m_iFirstProcess += this.m_iNumberOfProcessForRequest;
        this.m_iLastProcess += this.m_iNumberOfProcessForRequest;
    }

    resetCounters() {
        this.m_iNumberOfProcessForRequest = 40;
        this.m_iFirstProcess = 0;
    }
    /**
       * Calculate and retrieve process duration in HH:MM:SS format
       * Bind on ng-binding in the WorkspaceProcessList dialog
       * @param oProcess The process Object (see ProcessWorkspaceViewModel.java)
       * @returns {string} String of duration in HH:MM:SS format
       */
    getDuration(oProcess: any) {

        if (!oProcess.operationStartDate.endsWith("Z")) {
            oProcess.operationStartDate += "Z";
        }

        // start time by server
        let oStartTime: any = new Date(oProcess.operationStartDate);
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
    };

    openLogsDialog(oProcess) {
        let oDialogRef = this.m_oDialog.open(ProcessLogsDialogComponent, {
            height: '80vh',
            width: '70vw',
            data: { process: oProcess }
        })
    }

    openPayloadDialog(oProcess) {
        let oDialogRef = this.m_oDialog.open(PayloadDialogComponent, {
            height: '65vh',
            width: '50vw',
            data: { process: oProcess }
        })
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

    downloadProcessesFile() {
        this.m_oProcessWorkspaceService.getAllProcessesFromServer(this.m_sActiveWorkspaceId, null, null).subscribe(oResponse => {

            this.m_aoAllProcessesLogs = oResponse;
            let file = this.generateLogFile();

            let oLink = document.createElement('a');
            oLink.href = file;

            let sTimestamp = (new Date()).toISOString().replace(/[^0-9]/g, "_").slice(0, 19);

            oLink.download = "processes_" + this.m_sActiveWorkspaceName + "_" + sTimestamp;

            oLink.click();

        })
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

    generateLogFile() {
        let sText = this.makeStringLogFile();
        let oFile = this.generateFile(sText);
        return oFile;
    }

    deleteProcess(oProcessInput) {
        this.m_oProcessWorkspaceService.deleteProcess(oProcessInput);
        return true;
    }

    getOperationDescription(oOperation) {
        return WasdiUtils.utilsConvertOperationToDescription(oOperation)
    }

    applyFilters() {
        this.resetCounters();
        this.m_aoAllProcessesLogs = [];
        this.getAllProcessesLogs();
    }

    resetFilter() {
        this.m_oFilter = {
            sStatus: "",
            sType: "",
            sDate: "",
            sName: ""
        }
    }

    dismiss(event: MouseEvent): void {
        this.m_oDialog.closeAll();
        event.preventDefault();
    }

}