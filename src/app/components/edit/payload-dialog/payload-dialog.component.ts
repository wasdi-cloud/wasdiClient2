import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LegendPosition } from '@swimlane/ngx-charts';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';

interface ProductTimeSeriesChart {
  'chart-type': 'line';
  'chart-name': string;
  'chart-data': { name: string; series: { name: Date; value: number }[] }[];
}

export function parseProductTimeSeries(sChartJson: string): ProductTimeSeriesChart {
  const oChart = JSON.parse(sChartJson);
  if (oChart?.['chart-type'] !== 'line' || !Array.isArray(oChart['chart-data']) ||
      oChart['chart-data'].length === 0 || typeof oChart['chart-name'] !== 'string') {
    throw new Error('Expected a line chart with a title and data');
  }

  const aoSeries = oChart['chart-data'].map(oSeries => {
    if (typeof oSeries?.name !== 'string' || !Array.isArray(oSeries.series) || oSeries.series.length === 0) {
      throw new Error('Expected a named chart series with observations');
    }

    const aoPoints = oSeries.series.map((oPoint: { name?: unknown; value?: unknown } | null) => {
      if (typeof oPoint?.name !== 'string' || typeof oPoint.value !== 'number' || !Number.isFinite(oPoint.value)) {
        throw new Error('Expected a timestamp and a finite observation value');
      }

      const sTimestamp = oPoint.name;
      const bDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(sTimestamp);
      // Parse calendar dates in local time so axis labels and tooltips don't show the previous day.
      const oTimestamp = new Date(bDateOnly ? `${sTimestamp}T00:00:00` : sTimestamp);
      if (!/^\d{4}-\d{2}-\d{2}(T|$)/.test(sTimestamp) || !Number.isFinite(oTimestamp.getTime())) {
        throw new Error('Invalid observation timestamp');
      }
      return { name: oTimestamp, value: oPoint.value };
    });

    aoPoints.sort((oFirst, oSecond) => oFirst.name.getTime() - oSecond.name.getTime());
    return { name: oSeries.name, series: aoPoints };
  });

  return {
    'chart-type': 'line',
    'chart-name': oChart['chart-name'],
    'chart-data': aoSeries
  };
}

@Component({
    selector: 'app-payload-dialog',
    templateUrl: './payload-dialog.component.html',
    styleUrls: ['./payload-dialog.component.css'],
    standalone: false
})
export class PayloadDialogComponent implements OnInit {
  m_oProcess = this.m_oData.process;
  m_oProductChart: ProductTimeSeriesChart | undefined = this.m_oData.productChart;
  m_sActiveTab: string = "payload"
  m_sPayloadString: string = "";
  m_bIsWasdiDashboard: boolean = false;
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
  m_bShowYAxisLabel: boolean = false;

  /**
   * Show xAxis label (title):
   */
  m_bShowXAxisLabel: boolean = false;


  /**
   * Show Timeline: display a timeline control under the chart. Only available if a the x scale is linear or time
   */
  timeline: boolean = true;

  /**
   * Positioning of the Legend
   */
  legendPosition: LegendPosition = LegendPosition.Right

  formatProductTimestamp(oTimestamp: Date): string {
    const sDay = String(oTimestamp.getDate()).padStart(2, '0');
    const sMonth = String(oTimestamp.getMonth() + 1).padStart(2, '0');
    const sHours = String(oTimestamp.getHours()).padStart(2, '0');
    const sMinutes = String(oTimestamp.getMinutes()).padStart(2, '0');
    return `${sDay}/${sMonth}/${oTimestamp.getFullYear()} ${sHours}:${sMinutes}`;
  }

  m_sJsonSample: string = "";

  m_sTagColor: string = "red"

  m_sCopyLabel: string = this.m_oTranslate.instant("DIALOG_PAYLOAD_COPY");


  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oClipboard: Clipboard,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<PayloadDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    if (this.m_oProductChart) {
      this.checkWasdiDashboard({ wasdi_dashboard: [this.m_oProductChart] });
      this.m_bShowXAxisLabel = false;
      this.m_bShowYAxisLabel = false;
      this.m_bLegend = this.m_oProductChart['chart-data'].some(oSeries => oSeries.name.trim().length > 0);
      return;
    }

    this.checkWasdiDashboard(this.m_oData.process);
    this.checkWasdiDashboard(JSON.parse(this.m_oData.process.payload));
    let oParsed = JSON.parse(this.m_oProcess.payload)
    this.m_sJsonSample = JSON.stringify(oParsed, null, 2);

    this.setTagColor(this.m_oProcess.status)
  }


  /**
   * Convert Payload JSON to a string
   * @returns {void}
   */
  getPayloadString(): void {
    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_PAYLOAD_FETCH_ERROR")
    if (!this.m_oProcess.payload) {
      this.m_sPayloadString = this.m_oTranslate.instant("DIALOG_PAYLOAD_NO_INFO");
    } else {
      this.m_sPayloadString = this.m_oData.process.payload;

      try {
        let oParsed = JSON.parse(this.m_sPayloadString);
        let sPrettyPrint = JSON.stringify(oParsed, null, 2);
        this.m_sPayloadString = sPrettyPrint;
      } catch (error) {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
      }

    }
  }

  //If WASDI Dashboard value is defined, show the m_oData as a chart:
  checkWasdiDashboard(oPayload: any) {
    if (oPayload.hasOwnProperty('wasdi_dashboard')) {
      this.m_bIsWasdiDashboard = true;
      this.m_aoChartsInformation = oPayload.wasdi_dashboard;
      this.m_sActiveTab = 'dashboard';
      oPayload.wasdi_dashboard.forEach(oChart => {
        if (oChart['x-axis-name'] !== false) {
          this.m_bShowXAxisLabel = true;
        }
        if (oChart['y-axis-name'] !== false) {
          this.m_bShowYAxisLabel = true;
        }
      });
    } else {
      this.getPayloadString();
    }
  }

  setActiveTab(sActiveTab: string) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sActiveTab) === false) {
      this.m_sActiveTab = sActiveTab;
    }
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

  copyPayload() {
    this.m_oClipboard.copy(this.m_sJsonSample);
    this.m_sCopyLabel = this.m_oTranslate.instant("KEY_PHRASES.COPIED");
    setTimeout(() => {
      this.m_sCopyLabel = this.m_oTranslate.instant("DIALOG_PAYLOAD_COPY");
    }, 1000)
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }

  copyProcessObjId() {
    this.m_oClipboard.copy(this.m_oProcess.processObjId);
    this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD"), '', 'success-snackbar');
  }
}
