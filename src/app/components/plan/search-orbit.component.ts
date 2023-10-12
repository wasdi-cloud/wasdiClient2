import { Component, OnInit } from '@angular/core';

//Service Imports:
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { faSearch } from '@fortawesome/free-solid-svg-icons';



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
    private m_oAlertDialog: AlertDialogTopService,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    // private m_oConfigurationService: ConfigurationService,
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

  getSatellitesResources() {
    let sMessage = this.m_oTranslate.instant("MSG_ORBIT_ERROR2");

    this.m_oOpportunitySearchService.getSatellitesResources().subscribe({
      next: oResponse => {
        console.log(oResponse)
        if (oResponse.length > 0) {
          this.m_aoSatelliteResources = this.setDisabledAllOpportunities(oResponse);
        } else {
          this.m_oAlertDialog.openDialog(4000, sMessage);
        }
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, sMessage);
      }
    });
  }

  setDisabledAllOpportunities(aoSatelliteResources) {
    var iNumberOfSatellites = aoSatelliteResources.length;
    for (var iIndexSatellite = 0; iIndexSatellite < iNumberOfSatellites; iIndexSatellite++) {
      var oSatellite = aoSatelliteResources[iIndexSatellite];
      oSatellite.enable = false;
      // oSatellite.enabled = false;
      var iNumberOfSatelliteSensors = oSatellite.satelliteSensors.length;
      for (var iIndexSensors = 0; iIndexSensors < iNumberOfSatelliteSensors; iIndexSensors++) {
        var aoSatelliteSensors = oSatellite.satelliteSensors[iIndexSensors];
        aoSatelliteSensors.enable = false;
        // aoSatelliteSensors.enabled = false;
        var iNumberOfSensorModes = aoSatelliteSensors.sensorModes.length;
        for (var iIndexSensorMode = 0; iIndexSensorMode < iNumberOfSensorModes; iIndexSensorMode++) {
          var oSensorMode = aoSatelliteSensors.sensorModes[iIndexSensorMode];
          oSensorMode.enable = false;
          // oSensorMode.enabled = false;
        }
      }
    }

    return aoSatelliteResources
  }

  executeSearchOrbit(): boolean {
    let sErrorMsg = "";

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oGeoJSON)) {
      sErrorMsg += this.m_oTranslate.instant("MSG_SEARCH_ERROR_BBOX");
      this.m_oAlertDialog.openDialog(4000, sErrorMsg);
      return false;
    }

    let aoNodes = this.m_aoSelectedSatelliteNodes.map(oNode => {
      if (oNode.satelliteName) {
        return {
          enable: true,
          satelliteName: oNode.satelliteName,
          satelliteSensors: []
        }
      }

      return oNode;
    });
    if(!this.m_oOrbitSearch.acquisitionStartTime) {
      this.m_oAlertDialog.openDialog(4000, "Please select at least one Satellite Resource");
      return false;
    }

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
        console.log(oResponse)
      },
      error: oError => {
        console.log(oError)
        //Reload Satellite Resources (clean)
        this.getSatellitesResources();
        this.m_bShowSatelliteFilters = true;
      }
    })

    console.log(oJson)
    return true;
  }

  setSatelliteSensorEnable(oSatellite, sSatelliteSensorDescription?: string, sSatelliteSensorMode?: string): boolean {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sSatelliteSensorDescription)) {
      return false;
    }
    let iNumberOfSatelliteSensors = oSatellite.satelliteSensors.length;
    // let iNumberOfSensorsModes = oSatellite.satelliteSensors.sensorModes.length;
    for (let iIndexSatelliteSensor = 0; iIndexSatelliteSensor < iNumberOfSatelliteSensors; iIndexSatelliteSensor++) {
      let oSatelliteSensor = oSatellite.satelliteSensors[iIndexSatelliteSensor];
      if (sSatelliteSensorDescription === oSatelliteSensor.description) {
        oSatelliteSensor.enable = true;
      }
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sSatelliteSensorMode) === false) {
        let iNumberOfSensorModes = oSatelliteSensor.sensorModes.length;
        for (let iSensorMode = 0; iSensorMode < iNumberOfSensorModes; iSensorMode++) {
          if (oSatelliteSensor.sensorModes[iSensorMode].name === sSatelliteSensorMode) {
            oSatelliteSensor.sensorModes[iSensorMode].enable = true;
          }

        }

      }
    }
    return true;
  }

  cleanSatelliteResources(aoSatelliteResources) {
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

  /********** Event Listeners **********/

  /**
   * Listen for Selection Input from Search Orbit Resources Component (Satellite Resources):
   */
  getSelectedSatelliteResources(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      console.log(oEvent);
      this.m_aoSelectedSatelliteNodes = oEvent;
    }
  }

  getSelectedDates(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oOrbitSearch.acquisitionEndTime = oEvent.acquisitionEndTime;
      this.m_oOrbitSearch.acquisitionStartTime = oEvent.acquisitionStartTime;
    }
  }

  /**
   * Listen for Selection Input from Plan Map Component:
   */
  getBoundingBox(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oGeoJSON = oEvent.geoJSON;
      this.m_sPolygon = oEvent.polygon;
    }
  }

  /**
   * Listen for Selection Input fron Search ORbit Resources Component (Results Resources):
   */
  getSelectedOrbits() {

  }
}
