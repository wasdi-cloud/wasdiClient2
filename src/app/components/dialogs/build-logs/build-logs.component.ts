import { Component, OnInit, Inject } from '@angular/core';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-build-logs',
  templateUrl: './build-logs.component.html',
  styleUrls: ['./build-logs.component.css']
})
export class BuildLogsComponent implements OnInit {
  faX = faX;

  m_sInputProcessorId: string = "";
  m_sInputProcessorName: string = "";
  m_asBuildLogs: Array<any> = [];
  m_sBuildLogs: string = ""; 
  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialogRef: MatDialogRef<BuildLogsComponent>,
    private m_oProcessorService: ProcessorService
  ) { }

  ngOnInit(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData) === false) {
      this.m_sInputProcessorId = this.m_oData.sProcessorId;
      this.m_sInputProcessorName = this.m_oData.sProcessorName
      this.getProcessorBuildLogs(this.m_sInputProcessorId);
    }
  }

  getProcessorBuildLogs(sProcessoId: string) {
    this.m_oProcessorService.getProcessorLogsBuild(sProcessoId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_sBuildLogs = oResponse;
          this.m_asBuildLogs = oResponse.map(sBuildLog => {
            return sBuildLog.split("Step")
          })
        }
      },
      error: oError => { }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

}
