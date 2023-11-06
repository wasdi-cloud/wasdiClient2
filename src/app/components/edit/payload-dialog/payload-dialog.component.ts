import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LegendPosition } from '@swimlane/ngx-charts';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';



@Component({
  selector: 'app-payload-dialog',
  templateUrl: './payload-dialog.component.html',
  styleUrls: ['./payload-dialog.component.css']
})
export class PayloadDialogComponent implements OnInit {
  faXmark = faX;
  m_oProcess = this.m_oData.process;
  m_sActiveTab: string = "payload"
  m_sPayloadString: string = "";
  m_bIsWasdiDasboard: boolean = false;
  m_sGraphType: string;

  //Chart Configurations: 
  multi: any[];
  view: [number, number] = [700, 300];

  m_aoChartsInformation: Array<any> = []

  // options
  /**
   * Show the Chart Legend
   */
  m_bLegend: boolean = true;

  /**
   * Show Chart Labels:
   */
  showLabels: boolean = true;

  /**
   * Animate the Chart:
   */
  animations: boolean = true;

  /**
   * Show xAxis values:
   */
  xAxis: boolean = true;

  /**
   * Show yAxis values:
   */
  yAxis: boolean = true;

  /**
   * Show yAxis label (title):
   */
  showYAxisLabel: boolean = true;

  /**
   * Show xAxis label (title):
   */
  showXAxisLabel: boolean = true;

  /**
   * xAxis Label (title):
   */
  xAxisLabel: string;

  /**
   * xAxis label (title): 
   */
  yAxisLabel: string;

  /**
   * Show Timeline: display a timeline control under the chart. Only available if a the x scale is linear or time
   */
  timeline: boolean = true;

  /**
   * Positioning of the Legend
   */
  legendPosition: LegendPosition = LegendPosition.Right

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<PayloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public m_oData: any
  ) { }

  ngOnInit(): void {
    this.checkWasdiDashboard(this.m_oData.process);
    this.checkWasdiDashboard(JSON.parse(this.m_oData.process.payload))
  }


  /**
   * Convert Payload JSON to a string
   * @returns {void}
   */
  getPayloadString(): void {
    if (!this.m_oProcess.payload) {
      this.m_sPayloadString = "No payload information is available for the selected process";
    } else {
      this.m_sPayloadString = this.m_oData.process.payload;

      try {
        let oParsed = JSON.parse(this.m_sPayloadString);
        let sPrettyPrint = JSON.stringify(oParsed, null, 2);
        this.m_sPayloadString = sPrettyPrint;
      } catch (error) {
        this.m_oAlertDialog.openDialog(4000, "Problem getting Payload String");
      }

    }
  }

  //If WASDI Dashboard value is defined, show the m_oData as a chart:
  checkWasdiDashboard(oPayload: any) {
    if (oPayload.hasOwnProperty('wasdi_dashboard')) {
      this.m_bIsWasdiDasboard = true;
      console.log(oPayload.wasdi_dashboard)
      this.m_aoChartsInformation = oPayload.wasdi_dashboard;
      this.m_sActiveTab = 'dashboard';
      console.log(this.m_aoChartsInformation);
    } else {
      this.getPayloadString();
    }
  }

  setActiveTab(sActiveTab: string) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sActiveTab) === false) {
      this.m_sActiveTab = sActiveTab;
    }
  }

  dismiss(event: MouseEvent) {
    this.m_oDialogRef.close();
  }
}
