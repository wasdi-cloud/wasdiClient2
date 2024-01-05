import { Component, OnInit } from '@angular/core';

//Service Imports:
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { MapService } from 'src/app/services/map.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { SatelliteNode } from './search-orbit-resources/search-orbit-resources.component';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Font Awesome Icon Imports:
import { faSearch } from '@fortawesome/free-solid-svg-icons';

//Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';


@Component({
  selector: 'app-search-orbit',
  templateUrl: './search-orbit.component.html',
  styleUrls: ['./search-orbit.component.css']
})
export class SearchOrbit implements OnInit {
  //Font Awesome Icons: 
  faSearch = faSearch;

  m_bIsVisibleLoadingIcon: boolean;
  m_bIsDisabledSearchButton: boolean = false;
  m_bShowSatelliteFilters: boolean = true;

  m_aoSatelliteResources: Array<any> = [];
  m_oActiveWorkspace: any;
  m_aoOrbitResults: Array<any> = []
  m_aoSelectedSatelliteNodes: any = [];

  m_oGeoJSON: any = null;
  m_sPolygon: string = "";

  m_oOrbitSearch = {
    acquisitionStartTime: null,
    acquisitionEndTime: null,
    lookingType: "LEFT",
    viewAngle: {
      nearAngle: "",
      farAngle: ""
    },
    swathSize: {
      length: "",
      width: ""
    }
  }

  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oMapService: MapService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOpportunitySearchService: OpportunitySearchService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oProductService: ProductService,
    private m_oRabbitService: RabbitStompService,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngOnInit(): void {
    this.getSatellitesResources();
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  }

  /**
   * Get Satellite Resources from the Server
   */
  getSatellitesResources(): void {
    let sMessage = this.m_oTranslate.instant("MSG_ORBIT_ERROR2");

    this.m_oOpportunitySearchService.getSatellitesResources().subscribe({
      next: oResponse => {
        if (oResponse.length > 0) {
          this.m_aoSatelliteResources = this.setDisabledAllOpportunities(oResponse);
        } else {
          this.m_oNotificationDisplayService.openAlertDialog( sMessage);
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog( sMessage);
      }
    });
  }


  executeSearchOrbit(): boolean {
    let sErrorMsg = "";

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oGeoJSON)) {
      sErrorMsg += this.m_oTranslate.instant("MSG_SEARCH_ERROR_BBOX");
      this.m_oNotificationDisplayService.openAlertDialog( sErrorMsg);
      return false;
    }

    // Dates emitted when satellite resource selected - if none
    if (!this.m_oOrbitSearch.acquisitionStartTime || !this.m_aoSelectedSatelliteNodes) {
      this.m_oNotificationDisplayService.openAlertDialog( "Please select at least one Satellite Resource");
      return false;
    }

    //Format Date Objects for API Call:
    let sAcquisitionStartTime = this.m_oOrbitSearch.acquisitionStartTime.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, "");
    let sAcquisitionEndTime = this.m_oOrbitSearch.acquisitionEndTime.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, "");

    let oJson = {
      satelliteFilters: this.cleanSatelliteResources(this.m_aoSelectedSatelliteNodes),
      polygon: this.m_sPolygon,
      acquisitionStartTime: sAcquisitionStartTime,
      acquisitionEndTime: sAcquisitionEndTime
    }

    this.m_bShowSatelliteFilters = false;
    this.m_oOpportunitySearchService.searchOrbit(oJson).subscribe({
      next: oResponse => {
        this.m_aoOrbitResults = this.generateResultsData(oResponse);
      },
      error: oError => {
        //Reload Satellite Resources (clean)
        this.getSatellitesResources();
        this.m_bShowSatelliteFilters = true;
      }
    })

    return true;
  }


  cleanSatelliteResources(aoSatelliteResources): Array<SatelliteNode> {
    let aoTempResources = aoSatelliteResources
    if (aoTempResources.length > 0) {
      aoTempResources.forEach(oSatellite => {
        if (oSatellite.satelliteSensors.length > 0) {
          delete oSatellite.parent;
          oSatellite.satelliteSensors = oSatellite.satelliteSensors.filter(oResource => oResource.enable === true);
          if (oSatellite.satelliteSensors.length > 0) {
            oSatellite.satelliteSensors.forEach(oSensor => {
              delete oSensor.parent
              if (oSensor.sensorModes.length > 0) {
                oSensor.sensorModes = oSensor.sensorModes.filter(oMode => oMode.enable === true);
                oSensor.sensorModes.forEach(oMode => {
                  delete oMode.parent;
                  delete oMode.grandparent;
                })
              }
            })
          }
        }
      })
      aoTempResources = aoTempResources.filter(oSatellite => oSatellite.enable === true);
    }
    return aoTempResources;
  }

  setDisabledAllOpportunities(aoSatelliteResources): Array<SatelliteNode> {
    let iNumberOfSatellites = aoSatelliteResources.length;
    for (let iIndexSatellite = 0; iIndexSatellite < iNumberOfSatellites; iIndexSatellite++) {
      let oSatellite = aoSatelliteResources[iIndexSatellite];
      oSatellite.enable = false;
      // oSatellite.enabled = false;
      let iNumberOfSatelliteSensors = oSatellite.satelliteSensors.length;
      for (let iIndexSensors = 0; iIndexSensors < iNumberOfSatelliteSensors; iIndexSensors++) {
        let aoSatelliteSensors = oSatellite.satelliteSensors[iIndexSensors];
        aoSatelliteSensors.enable = false;
        // aoSatelliteSensors.enabled = false;
        let iNumberOfSensorModes = aoSatelliteSensors.sensorModes.length;
        for (let iIndexSensorMode = 0; iIndexSensorMode < iNumberOfSensorModes; iIndexSensorMode++) {
          let oSensorMode = aoSatelliteSensors.sensorModes[iIndexSensorMode];
          oSensorMode.enable = false;
          // oSensorMode.enabled = false;
        }
      }
    }
    return aoSatelliteResources
  }

  /**
   * Create the node format to be read from the Search Orbit Results Component Tree: 
   * @param aoData 
   * @returns {Array<any>}
   */
  generateResultsData(aoData): Array<any> {
    let oReturnValue = null;
    // Ensure passed Data contains a value: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoData)) {
      return null;
    }

    //Format Dates from in Data:
    aoData.map(oResult => {
      let oAcquisitionStartTime = new Date(oResult.AcquisitionStartTime);
      let oAcquisitionEndTime = new Date(oResult.AcquisitionEndTime)
      oResult.AcquisitionStartTime = oAcquisitionStartTime.toLocaleDateString('en-GB');
      oResult.AcquisitionEndTime = oAcquisitionEndTime.toLocaleDateString('en-GB')
    })

    // Format for Mat-Tree Nodes reading: 
    let aoDateNodes: Array<any> = aoData.map(oResult => {
      return {
        acquisitionStartTime: oResult.AcquisitionStartTime,
        acquisitionEndTime: oResult.AcquisitionEndTime,
        directions: [
          { left: [] },
          { right: [] }
        ]

      }
    })

    // Clean duplicate Dates from Array
    let aoUniqueDateNodes = [];

    let aoCleanedDateNodes = aoDateNodes.filter(element => {
      let isDuplicate = aoUniqueDateNodes.includes(element.acquisitionStartTime);
      if (!isDuplicate) {
        aoUniqueDateNodes.push(element.acquisitionStartTime);
        return true;
      }
      return false;
    });

    //Create Nodes for Left and Right Directions: 
    for (let iCleanedNodeIndex = 0; iCleanedNodeIndex < aoCleanedDateNodes.length; iCleanedNodeIndex++) {
      aoData.forEach(oResult => {
        if (oResult.AcquisitionStartTime === aoCleanedDateNodes[iCleanedNodeIndex].acquisitionStartTime) {
          if (oResult.SensorLookDirection === "LEFT") {
            aoCleanedDateNodes[iCleanedNodeIndex].directions[0].left.push({
              swathFootPrint: oResult.SwathFootPrint,
              swathName: oResult.SwathName
            });
          }

          if (oResult.SensorLookDirection === "RIGHT") {
            aoCleanedDateNodes[iCleanedNodeIndex].directions[1].right.push({
              swathFootPrint: oResult.SwathFootPrint,
              swathName: oResult.SwathName
            });
          }
        }
      })
    }

    if (aoCleanedDateNodes.length > 0) {
      oReturnValue = aoCleanedDateNodes;
    }
    return oReturnValue;
  }


  /********** Event Listeners **********/

  /**
   * Listen for Selection Input from Search Orbit Resources Component (Satellite Resources):
   * @param oEvent 
   * @returns {void}
   */
  getSelectedSatelliteResources(oEvent: any): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_aoSelectedSatelliteNodes = oEvent;
    }
  }

  /**
   * Listen for date selection from Search Orbit Resources Componenet (Satellite Resources):
   * @param oEvent 
   * @returns {void}
   */
  getSelectedDates(oEvent: any): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oOrbitSearch.acquisitionEndTime = oEvent.acquisitionEndTime;
      this.m_oOrbitSearch.acquisitionStartTime = oEvent.acquisitionStartTime;
    }
  }

  /**
   * Listen for Selection Input from Plan Map Component:
   * @param oEvent 
   * @returns {void}
   */
  getBoundingBox(oEvent: any): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oGeoJSON = oEvent.geoJSON;
      this.m_sPolygon = oEvent.polygon;
    }
  }

  getNavigationStatus(oEvent: any): void {
    if(FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_bShowSatelliteFilters = true;
      this.getSatellitesResources();
    }
  }
}
