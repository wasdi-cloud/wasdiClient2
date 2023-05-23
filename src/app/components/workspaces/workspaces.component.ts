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
import Utils from 'src/app/lib/utils/WasdiJSUtils';
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
  m_aoSatelliateInputTracks: any[];
  m_aoSatellitePositions: any[];
  m_oFakePosition: any = null;
  m_oUfoPointer: any;

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
          console.log(oResponse)
          for (let iOriginalSat = 0; iOriginalSat < this.m_aoSatelliateInputTracks.length; iOriginalSat++) {
            if (this.m_aoSatelliateInputTracks[iOriginalSat].name === oResponse.code) {
              oActualSat = this.m_aoSatelliateInputTracks[iOriginalSat];
              break;
            }
          }

          let sDescription = oActualSat.description;
          sDescription += "\n";
          sDescription += oResponse.currentTime;

          let oActualPosition = this.m_oGlobeService.drawPointWithImage(Utils.utilsProjectConvertCurrentPositionFromServerInCesiumDegrees(oResponse.currentPosition), oActualSat.icon, sDescription, oActualSat.label, 32, 32);
          this.m_aoSatellitePositions.push(oActualPosition);

          if (this.m_oFakePosition === null) {
            if (oResponse.lastPositions != null) {

              var iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));

              this.m_oFakePosition = oResponse.lastPositions[iFakeIndex];

              var aoUfoPosition = Utils.utilsProjectConvertCurrentPositionFromServerInCesiumDegrees(this.m_oFakePosition);
              aoUfoPosition[2] = aoUfoPosition[2] * 4;
              this.m_oUfoPointer = this.m_oGlobeService.drawPointWithImage(aoUfoPosition, "assets/icons/alien.svg", "U.F.O.", "?");

              iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));
              var aoMoonPosition = Utils.utilsProjectConvertCurrentPositionFromServerInCesiumDegrees(oResponse.lastPositions[iFakeIndex]);
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
    
  }
}
