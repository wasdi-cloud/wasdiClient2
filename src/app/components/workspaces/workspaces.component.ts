import { Component, OnInit } from '@angular/core';

//Import Services:
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import { ProductService } from 'src/app/services/api/product.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Import Componenets: 
import { NewWorkspaceDialogComponent } from './new-workspace-dialog/new-workspace-dialog.component';

//Import Angular Materials:
import { MatDialog } from '@angular/material/dialog';

//Import Models:
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

//Font Awesome Imports:
import { faArrowsUpDown, faPlay, faPlus, faStop } from '@fortawesome/free-solid-svg-icons';

//Import Utilities: 
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

//Declare Cesium: 
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
  styleUrls: ['./workspaces.component.css'],
  host: { 'class': 'flex-fill' }
})
export class WorkspacesComponent implements OnInit {
  //Icons: 
  faArrowsUpDown = faArrowsUpDown;
  faPlus = faPlus
  faPlay = faPlay;
  faStop = faStop;

  m_aoWorkspacesList: Workspace[] = []
  activeWorkspace!: WorkspaceViewModel;
  sharedUsers!: string[];
  setInterval: any;

  m_bShowSatellites: boolean;
  m_aoSatelliateInputTracks: any[] = [];
  m_aoSatellitePositions: any[] = [];
  m_oFakePosition: any = null;
  m_oUfoPointer: any;
  m_aoSateliteInputTraks: any[] = [];

  m_bLoadingWSFiles: boolean = false;
  m_bIsVisibleFiles: boolean = false;
  m_bIsOpenInfo: boolean = true;
  m_aoProducts: Array<any> = [];
  m_oWorkspaceViewModel: any;
  m_oSelectedProduct: any;

  m_sWorkspaceSearchInput: string = '';
  m_aoSortingOptions = [
    {
      title: "Newest",
      column: "date",
      direction: "asc"
    },
    {
      title: "Oldest",
      column: "date",
      direction: "desc"
    },
    {
      title: "Workspace A-Z",
      column: "workspace",
      direction: "desc"
    }, {
      title: "Workspace Z-A",
      column: "workspace",
      direction: "asc"
    }, {
      title: "Owner A-Z",
      column: "owner",
      direction: "desc"
    }, {
      title: "Owner Z-A",
      column: "owner",
      direction: "asc"
    }
  ]
  m_oActiveSortingOption: any = {}
  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oGlobeService: GlobeService,
    private m_oOpportunitySearchService: OpportunitySearchService,
    private m_oProductService: ProductService,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService) { }


  ngOnInit(): void {
    console.log("WorkspaceComponent.ngOnInit")
    this.fetchWorkspaceInfoList();
    this.m_oGlobeService.initRotateGlobe('CesiumContainer3');
    this.getTrackSatellite();
    this.m_bShowSatellites = true;

    this.setInterval = setInterval(() => {
      this.updateSatellitesPositions();
    }, 15000)

  }

  ngOnDestroy(): void {

    console.log("WorkspaceComponent.ngOnDestroy")

    //Destroy Interval after closing: 
    if (this.setInterval) {
      clearInterval(this.setInterval);
    }

    this.m_oGlobeService.clearGlobe()
  }

  fetchWorkspaceInfoList() {
    let sMessage: string;
    this.m_oTranslate.get("MSG_MKT_WS_OPEN_ERROR").subscribe(sResponse => {
      sMessage = sResponse
    })

    let oUser: User = this.m_oConstantsService.getUser();
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oUser) === false) {
      this.m_oWorkspaceService.getWorkspacesInfoListByUser().subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
            this.m_oAlertDialog.openDialog(4000, sMessage);
          } else {
            this.m_aoWorkspacesList = oResponse;
          }
        },
        error: oError => { }
      });
    }
  }

  onDeleteWorkspace(oWorkspace: Workspace) {
    this.fetchWorkspaceInfoList();
  }

  onShowWorkspace(oWorkspace: Workspace) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      this.activeWorkspace = response
      this.sharedUsers = response.sharedUsers
    })
    this.loadProductList(oWorkspace);
  }

  loadProductList(oWorkspace: Workspace) {
    this.m_bLoadingWSFiles = true;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) === true) {
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.workspaceId) === true) {
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.activeWorkspace) === false) {
      this.activeWorkspace.workspaceId = oWorkspace.workspaceId;
      this.deselectWorkspace();
    }

    this.m_bIsVisibleFiles = true;
    this.m_bIsOpenInfo = false;
    let oWorkspaceId = oWorkspace.workspaceId;
    this.m_bIsVisibleFiles = true;
    let sError = this.m_oTranslate.instant("MSG_MKT_WS_OPEN_ERROR");

    this.m_oWorkspaceService.getWorkspaceEditorViewModel(oWorkspaceId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_oWorkspaceViewModel = oResponse;
        }
      },
      error: oError => { }
    });

    this.m_oProductService.getProductLightListByWorkspace(oWorkspaceId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          for (let i = 0; i < this.m_aoProducts.length; i++) {
            //this.m_oGlobeService.removeEntity(this.m_aoProducts[i].oRectangle)
          }

          this.m_aoProducts = [];
          for (let iIndex = 0; iIndex < oResponse.length; iIndex++) {
            this.m_aoProducts.push(oResponse[iIndex]);
          }
          this.m_bIsOpenInfo = true;
          //this.activeWorkspace = oWorkspace;
        }

        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProducts) || this.m_aoProducts.length == 0) {
          this.m_bIsVisibleFiles = false;
        } else {
          //add globe bounding box
          this.createBoundingBoxInGlobe();
        }

        this.m_bLoadingWSFiles = false;
      },
      error: oError => { }
    });
    return true;
  }

  createBoundingBoxInGlobe() {
    let oRectangle = null;
    let aArraySplit = [];
    let iArraySplitLength = 0;
    let aiInvertedArraySplit = [];

    let aoTotalArray = [];

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProducts) === true) {
      return false;
    }

    let iProductsLength = this.m_aoProducts.length;

    // For each product
    for (let iIndexProduct = 0; iIndexProduct < iProductsLength; iIndexProduct++) {
      aiInvertedArraySplit = [];
      aArraySplit = [];
      // skip if there isn't the product bounding box
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProducts[iIndexProduct].bbox) === true) continue;

      // Split bbox string
      aArraySplit = this.m_aoProducts[iIndexProduct].bbox.split(",");
      iArraySplitLength = aArraySplit.length;

      if (iArraySplitLength < 10) continue;

      let bHasNan = false;
      for (let iValues = 0; iValues < aArraySplit.length; iValues++) {
        if (isNaN(aArraySplit[iValues])) {
          bHasNan = true;
          break;
        }
      }

      if (bHasNan) continue;

      aoTotalArray.push.apply(aoTotalArray, aArraySplit);

      for (let iIndex = 0; iIndex < iArraySplitLength - 1; iIndex = iIndex + 2) {
        aiInvertedArraySplit.push(aArraySplit[iIndex + 1]);
        aiInvertedArraySplit.push(aArraySplit[iIndex]);
      }

      oRectangle = this.m_oGlobeService.addRectangleOnGlobeParamArray(aiInvertedArraySplit);
      this.m_aoProducts[iIndexProduct].oRectangle = oRectangle;
      this.m_aoProducts[iIndexProduct].aBounds = aiInvertedArraySplit;
    }


    let aoBounds = [];
    for (let iIndex = 0; iIndex < aoTotalArray.length - 1; iIndex = iIndex + 2) {
      aoBounds.push(new Cesium.Cartographic.fromDegrees(aoTotalArray[iIndex + 1], aoTotalArray[iIndex]));
    }

    let oWSRectangle = Cesium.Rectangle.fromCartographicArray(aoBounds);
    let oWSCenter = Cesium.Rectangle.center(oWSRectangle);

    //oGlobe.camera.setView({
    this.m_oGlobeService.getGlobe().camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(oWSCenter.longitude, oWSCenter.latitude, this.m_oGlobeService.getWorkspaceZoom()),
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });

    this.m_oGlobeService.stopRotationGlobe();

    return true;
  }

  onSelectProduct(oProduct: any) {
    if (this.m_oSelectedProduct === oProduct) {
      this.m_oSelectedProduct = null;
      return false;
    }
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.aBounds) === true) {
      return false;
    }

    this.m_oSelectedProduct = oProduct;
    let aBounds = oProduct.aBounds;
    let aBoundsLength = aBounds.length;
    let aoRectangleBounds = [];
    let oGlobe = this.m_oGlobeService.getGlobe();

    // let temp = null;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct) === true) {
      return false;
    }

    this.m_oGlobeService.stopRotationGlobe();

    for (let iIndexBound = 0; iIndexBound < aBoundsLength - 1; iIndexBound = iIndexBound + 2) {
      aoRectangleBounds.push(new Cesium.Cartographic.fromDegrees(aBounds[iIndexBound], aBounds[iIndexBound + 1]));
    }

    let zoom = Cesium.Rectangle.fromCartographicArray(aoRectangleBounds);
    oGlobe.camera.setView({
      destination: zoom,
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });

    return true;
  }

  deselectWorkspace() {

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

              let iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));

              this.m_oFakePosition = oResponse.lastPositions[iFakeIndex];

              let aoUfoPosition = WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(this.m_oFakePosition);
              aoUfoPosition[2] = aoUfoPosition[2] * 4;
              this.m_oUfoPointer = this.m_oGlobeService.drawPointWithImage(aoUfoPosition, "assets/icons/alien.svg", "U.F.O.", "?");

              iFakeIndex = Math.floor(Math.random() * (oResponse.lastPositions.length));
              let aoMoonPosition = WasdiUtils.projectConvertCurrentPositionFromServerInCesiumDegrees(oResponse.lastPositions[iFakeIndex]);
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
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
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
      for (let i = 0; i < this.m_aoSatellitePositions.length; i++) {
        this.m_oGlobeService.removeEntity(this.m_aoSatellitePositions[i]);
      }

      this.m_oGlobeService.removeEntity(this.m_oUfoPointer);
      this.m_oUfoPointer = null;
      this.m_oFakePosition = null;

      this.m_aoSatellitePositions = [];
    }
  }

  setSorting(oSortingOption) {
    let bIsDescending: boolean = false;
    let propertyName: string = '';
    //Set Active Sorting Option: 
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSortingOption) === false) {
      this.m_oActiveSortingOption = oSortingOption;
      oSortingOption.direction === 'asc' ? bIsDescending = true : bIsDescending = false;
      oSortingOption.column === 'date' ? propertyName = 'creationDate' : oSortingOption.column === 'workspace' ? propertyName = 'workspaceName' : propertyName = 'ownerUserId';
    }
    if (propertyName === 'ownerUserId' || propertyName === 'workspaceName') {
      this.m_aoWorkspacesList.sort((oWorkspace1: any, oWorkspace2: any) => {
        if (oWorkspace1[propertyName].toLowerCase() < oWorkspace2[propertyName].toLowerCase()) {
          return bIsDescending ? 1 : -1;
        }
        if (oWorkspace1[propertyName].toLowerCase() > oWorkspace2[propertyName].toLowerCase()) {
          return bIsDescending ? -1 : 1;
        }
        return 0;
      });
    }
    if (propertyName === 'creationDate') {
      this.m_aoWorkspacesList.sort((oWorkspace1: any, oWorkspace2: any) => {
        if (bIsDescending === true) {
          return <any>new Date(oWorkspace2[propertyName]) - <any>new Date(oWorkspace1[propertyName]);
        } else {
          return <any>new Date(oWorkspace1[propertyName]) - <any>new Date(oWorkspace2[propertyName]);
        }
      });
    }

  }
}
