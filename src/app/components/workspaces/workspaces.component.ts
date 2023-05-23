import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faPlay, faPlus, faStop } from '@fortawesome/free-solid-svg-icons';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { NewWorkspaceDialogComponent } from './new-workspace-dialog/new-workspace-dialog.component';
import { CesiumService } from 'src/app/shared/cesium.service';
import { GlobeService } from 'src/app/services/globe.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
declare let Cesium: any;

export interface WorkspaceViewModel {
  activeNode: boolean;
  apiUrl: string;
  cloudProvider: string;
  creationDate: number;
  lastEditDate: number;
  name: string;
  nodeCode: string;
  processesCount: string;
  sharedUsers: string[];
  slaLink: string;
  userId: string;
  workspaceId: string;
}

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {
  //Icons: 
  faPlus = faPlus
  faPlay = faPlay;
  faStop = faStop;

  workspaces: Workspace[] = []
  activeWorkspace!: WorkspaceViewModel;
  sharedUsers!: string[];
  setInterval: any;
  m_bShowSatellites: boolean;
  m_aoSatelliateInputTracks: any[] = [];
  m_aoSatellitePositions: any[] = [];
  m_oFakePosition: any = null;
  m_oUfoPointer: any;
  m_aoSateliteInputTraks: any[] = [];

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oGlobeService: GlobeService,
    private m_oOpportunitySearchService: OpportunitySearchService,
    private oWorkspaceService: WorkspaceService) { }


  ngOnInit(): void {
    this.fetchWorkspaceInfoList();
    this.m_oGlobeService.initRotateGlobe('CesiumContainer3');
    this.getTrackSatellite();
    this.m_bShowSatellites = true;

    this.setInterval = setInterval(() => {
      this.updateSatellitesPositions();
    }, 15000)

  }

  ngOnDestroy(): void {
    //Destroy Interval after closing: 
    if (this.setInterval) {
      clearInterval(this.setInterval);
    }
  }

  fetchWorkspaceInfoList() {
    console.log("fetching workspaces")

    let oUser: User = this.m_oConstantsService.getUser();
    if (oUser !== {} as User) {
      this.oWorkspaceService.getWorkspacesInfoListByUser().subscribe(response => {
        this.workspaces = response;
      })
    }
  }

  onDeleteWorkspace(oWorkspace: Workspace) {
    this.fetchWorkspaceInfoList();
  }

  onShowWorkspace(oWorkspace: Workspace) {
    this.oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      this.activeWorkspace = response
      this.sharedUsers = response.sharedUsers
    })
  }

  openNewWorkspaceDialog() {
    let oDialogRef = this.m_oDialog.open(NewWorkspaceDialogComponent, {
      width: '30vw'
    })
  }

  stopGlobeRotation() {
    this.m_oGlobeService.stopRotationGlobe();
  }

  startGlobeRotation() {
    this.m_oGlobeService.startRotationGlobe(3);
  }

  getTrackSatellite() {
    let iSat;

    this.m_aoSatelliateInputTracks = this.m_oGlobeService.getSatelliteTrackInputList();

    //Remove all old Entities from the map:
    this.m_oGlobeService.removeAllEntities();

    for (let iSat = 0; iSat < this.m_aoSatelliateInputTracks.length; iSat++) {
      let oActualSat = this.m_aoSatelliateInputTracks[iSat];

      this.m_oOpportunitySearchService.getTrackSatellite(this.m_aoSatelliateInputTracks[iSat].name).subscribe(oResponse => {
        if (oResponse) {
          for (let iOriginalSat = 0; iOriginalSat < this.m_aoSatelliateInputTracks.length; iOriginalSat++) {
            if (this.m_aoSatelliateInputTracks[iOriginalSat].name === oResponse.code) {
              oActualSat = this.m_aoSatelliateInputTracks[iOriginalSat];
              break;
            }
          }

          let sDescription = oActualSat.description;
          sDescription += "\n";
          sDescription += oResponse.currentTime;

          let oActualPosition = this.m_oGlobeService.drawPointWithImage(WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(oResponse.currentPosition), oActualSat.icon, sDescription, oActualSat.label, 32, 32);
          this.m_aoSatellitePositions.push(oActualPosition);

          if (this.m_oFakePosition === null) {
            if (oResponse.lastPositions != null) {

              var iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));

              this.m_oFakePosition = oResponse.lastPositions[iFakeIndex];

              var aoUfoPosition = WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(this.m_oFakePosition);
              aoUfoPosition[2] = aoUfoPosition[2] * 4;
              this.m_oUfoPointer = this.m_oGlobeService.drawPointWithImage(aoUfoPosition, "assets/icons/alien.svg", "U.F.O.", "?");

              iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));
              var aoMoonPosition = WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(oResponse.lastPositions[iFakeIndex]);
              //aoMoonPosition [0] = 0.0;
              //aoMoonPosition[1] = 0.0;
              aoMoonPosition[2] = 384400000;
              //aoMoonPosition[2] = 3844000;

              this.m_oGlobeService.drawPointWithImage(aoMoonPosition, "assets/icons/sat_death.svg", "Moon", "-");

            }
          }
        }
      })
    }
  }

  updateSatellitesPositions() {
    if (!this.m_aoSatellitePositions) {
      return false;
    }

    this.m_aoSatelliateInputTracks = this.m_oGlobeService.getSatelliteTrackInputList();

    this.updatePosition();

    return true;
  }

  updatePosition() {
    let sSatellites: string = "";
    for (let iSat = 0; iSat < this.m_aoSatelliateInputTracks.length; iSat++) {
      sSatellites += this.m_aoSatelliateInputTracks[iSat].name + "-";
    }

    this.m_oOpportunitySearchService.getUpdatedTrackSatellite(sSatellites).subscribe(
      oResponse => {
        if (!FadeoutUtils.isObjectNullOrUndefined(oResponse)) {
          for (let iSatellites = 0; iSatellites < oResponse.length; iSatellites++) {
            let oActualDataByServer = oResponse[iSatellites];

            let iIndexActualSatellitePosition = this.getIndexActualSatellitePositions(oResponse[iSatellites].code);

            if (iIndexActualSatellitePosition >= 0) {
              let oSatellite = this.m_aoSatellitePositions[iIndexActualSatellitePosition];
              let aPosition = WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(oActualDataByServer.currentPosition);
              let oCesiumBoundaries = Cesium.Cartesian3.fromDegrees(aPosition[0], aPosition[1], aPosition[2]);
              this.m_oGlobeService.updateEntityPosition(oSatellite, oCesiumBoundaries);
            }
          }
        }
      }
    )
  }

  getIndexActualSatellitePositions(sCode: string) {
    for (let iOriginalSat = 0; iOriginalSat < this.m_aoSatelliateInputTracks.length; iOriginalSat++) {
      if (this.m_aoSateliteInputTraks[iOriginalSat]) {
        if (this.m_aoSateliteInputTraks[iOriginalSat].name === sCode) {
          return iOriginalSat;
        }
      }

    }
    return -1;
  }

  deleteSentinel1a() {
    if (this.m_bShowSatellites) {
      this.getTrackSatellite();
    } else {
      for (var i = 0; i < this.m_aoSatellitePositions.length; i++) {
        this.m_oGlobeService.removeEntity(this.m_aoSatellitePositions[i]);
      }

      this.m_oGlobeService.removeEntity(this.m_oUfoPointer);
      this.m_oUfoPointer = null;
      this.m_oFakePosition = null;

      this.m_aoSatellitePositions = [];
    }
  }

}
