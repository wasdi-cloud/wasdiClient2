import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LegendPosition } from '@swimlane/ngx-charts';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
export var multi = {
  "wasdi_dashboard": [
    {
      "chart_name": "",
      "chart_type": "bar-horizontal",
      "x-axis-name": "Census Date",
      "y-axis-name": "GDP Per Capita",
      "chart_data": [
        {
          "name": "Gibraltar",
          "series": [
            {
              "value": 2735,
              "name": "2016-09-19T06:21:56.680Z"
            },
            {
              "value": 5527,
              "name": "2016-09-19T17:29:34.596Z"
            },
            {
              "value": 4273,
              "name": "2016-09-23T05:20:55.421Z"
            },
            {
              "value": 6159,
              "name": "2016-09-19T05:34:47.335Z"
            },
            {
              "value": 2384,
              "name": "2016-09-17T06:52:26.965Z"
            }
          ]
        },
        {
          "name": "Bouvet Island",
          "series": [
            {
              "value": 3060,
              "name": "2016-09-19T06:21:56.680Z"
            },
            {
              "value": 3443,
              "name": "2016-09-19T17:29:34.596Z"
            },
            {
              "value": 4053,
              "name": "2016-09-23T05:20:55.421Z"
            },
            {
              "value": 4083,
              "name": "2016-09-19T05:34:47.335Z"
            },
            {
              "value": 3790,
              "name": "2016-09-17T06:52:26.965Z"
            }
          ]
        },
        {
          "name": "Sudan",
          "series": [
            {
              "value": 4135,
              "name": "2016-09-19T06:21:56.680Z"
            },
            {
              "value": 5524,
              "name": "2016-09-19T17:29:34.596Z"
            },
            {
              "value": 5550,
              "name": "2016-09-23T05:20:55.421Z"
            },
            {
              "value": 5209,
              "name": "2016-09-19T05:34:47.335Z"
            },
            {
              "value": 4408,
              "name": "2016-09-17T06:52:26.965Z"
            }
          ]
        },
        {
          "name": "Cyprus",
          "series": [
            {
              "value": 3467,
              "name": "2016-09-19T06:21:56.680Z"
            },
            {
              "value": 4449,
              "name": "2016-09-19T17:29:34.596Z"
            },
            {
              "value": 2412,
              "name": "2016-09-23T05:20:55.421Z"
            },
            {
              "value": 5872,
              "name": "2016-09-19T05:34:47.335Z"
            },
            {
              "value": 6337,
              "name": "2016-09-17T06:52:26.965Z"
            }
          ]
        },
        {
          "name": "Brunei Darussalam",
          "series": [
            {
              "value": 3230,
              "name": "2016-09-19T06:21:56.680Z"
            },
            {
              "value": 4792,
              "name": "2016-09-19T17:29:34.596Z"
            },
            {
              "value": 4516,
              "name": "2016-09-23T05:20:55.421Z"
            },
            {
              "value": 5899,
              "name": "2016-09-19T05:34:47.335Z"
            },
            {
              "value": 5872,
              "name": "2016-09-17T06:52:26.965Z"
            }
          ]
        }
      ]
    }]
}

@Component({
  selector: 'app-payload-dialog',
  templateUrl: './payload-dialog.component.html',
  styleUrls: ['./payload-dialog.component.css']
})
export class PayloadDialogComponent {
  faXmark = faX;
  m_oProcess = this.m_oData.process;
  m_sPayloadString: string = "";
  m_bIsWasdiDasboard: boolean = false;
  m_sGraphType: string;

  //Chart Configurations: 
  multi: any[];
  view: [number, number] = [700, 300];

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
    @Inject(MAT_DIALOG_DATA) public m_oData: any
    ) {

    //this.getPayloadString(); -> Commented for Charts Testing
    this.xAxisLabel = multi.wasdi_dashboard[0]['x-axis-name'];
    this.yAxisLabel = multi.wasdi_dashboard[0]['y-axis-name'];
    this.checkWasdiDashboard(multi);
    this.m_sGraphType = multi.wasdi_dashboard[0]['chart_type'];
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
      console.log(oPayload.wasdi_dashboard[0].chart_data)
      let mapped = oPayload.wasdi_dashboard[0].chart_data.map(oChartData => {
        return {
          name: oChartData.name,
          series: oChartData.series.map(oSeriesData => {
            return {
              value: oSeriesData.value,
              name: oSeriesData.name.slice(0, oSeriesData.name.indexOf("T"))
            }
          })
        }
      });
      this.multi = mapped;
      // this.multi = oPayload.wasdi_dashboard[0].chart_data
    }
  }
  

  dismiss(event: MouseEvent) {
    this.m_oDialog.closeAll();
  }
}
