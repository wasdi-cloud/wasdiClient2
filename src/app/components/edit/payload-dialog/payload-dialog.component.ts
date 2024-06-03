import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { LegendPosition } from '@swimlane/ngx-charts';
import { faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Clipboard } from '@angular/cdk/clipboard';

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
  view: [number, number] = [1000, 700];

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
   * Positioning of the Legend
   */
  legendPosition: LegendPosition = LegendPosition.Right

  m_sJsonSample: string = "";

  m_sTagColor: string = "red"

  m_sCopyLabel: string = "COPY PAYLOAD"
  
  /**
   * Further Options for charts 
   */

  /**
   * Show Timeline: display a timeline control under the chart. Only available if a the x scale is linear or time
   */

  m_bTimelineEnable = true;

  serieManuale = [
    {
      "name": "Denmark",
      "series": [
        {
          "value": 3759,
          "name": new Date("2016-09-13T10:24:24.173Z")
        },
        {
          "value": 5455,
          "name": new Date("2016-09-15T17:07:55.443Z")
        },
        {
          "value": 5562,
          "name": new Date("2016-09-23T21:07:10.229Z")
        },
        {
          "value": 4402,
          "name": new Date("2016-09-13T09:11:30.591Z")
        },
        {
          "value": 6844,
          "name": new Date("2016-09-19T13:07:16.972Z")
        }
      ]
    
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oClipboard: Clipboard,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<PayloadDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) { }

  ngOnInit(): void {
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
    if (!this.m_oProcess.payload) {
      this.m_sPayloadString = "No payload information is available for the selected process";
    } else {
      this.m_sPayloadString = this.m_oData.process.payload;

      try {
        let oParsed = JSON.parse(this.m_sPayloadString);
        let sPrettyPrint = JSON.stringify(oParsed, null, 2);
        this.m_sPayloadString = sPrettyPrint;
      } catch (error) {
        this.m_oNotificationDisplayService.openAlertDialog("Problem getting Payload String");
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
      // Dashboard content is an array of charts 
      oPayload.wasdi_dashboard.forEach(oChart => {
        console.log(oChart)
        if (oChart['x-axis-name'] !== false) {
          this.m_bShowXAxisLabel = true;
        }
        if (oChart['y-axis-name'] !== false) {
          this.m_bShowYAxisLabel = true;
        }
        // adding timeline option
        if (oChart['timeline'] !== false) {
          this.m_bTimelineEnable = true;
        }
        //for each chart data 
        // if there is a series 
        if (oPayload.wasdi_dashboard[0]["chart-data"][0].hasOwnProperty("series")){
              // and can be converted to dates 
              let a = Date.parse(oPayload.wasdi_dashboard[0]["chart-data"][0].series[0].name);
              if(!isNaN(a)){
                oPayload.wasdi_dashboard[0]["chart-data"][0].series.forEach((element) => element.name = new Date(element.name) )
              }
              
        }
      });
      //console.log(this.m_aoChartsInformation);
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

    this.m_sCopyLabel = "COPIED!";
    setTimeout(() => {
      this.m_sCopyLabel = "COPY PAYLOAD";
    }, 1000)
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
