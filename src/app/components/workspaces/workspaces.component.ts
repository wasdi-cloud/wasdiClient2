import { Component, OnInit } from '@angular/core';

//Import Services:
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OpportunitySearchService } from 'src/app/services/api/opportunity-search.service';
import { ProductService } from 'src/app/services/api/product.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';


//Import Models:;
import { Workspace } from 'src/app/shared/models/workspace.model';

//Import Utilities:
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

//Declare Cesium:
declare let Cesium: any;

/**
 * Definitio of the Workspace View Mode obtained by the server
 */
export interface WorkspaceViewModel {
  activeNode: boolean;
  apiUrl: string;
  cloudProvider: string;
  creationDate: number;
  lastEditDate: number;
  name: string;
  nodeCode: string;
  processesCount: string;
  readOnly: boolean;
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

  /**
   * Array of available workspaces
   */
  m_aoWorkspacesList: Workspace[] = []

  /**
   * Workspace actually seletected
   */
  m_oActiveWorkspace!: WorkspaceViewModel;

  /**
   * List of the users that shares the workspace
   */
  m_asSharedUsers!: string[];

  /**
   * Reference to the timer function used to update satellilte positions
   */
  m_oSetIntervalReference: any;

  /**
   * Flag to know if we need to show satellites or not
   */
  m_bShowSatellites: boolean;

  /**
   * Array of the input tracks for each satellite
   */
  m_aoSatelliteInputTracks: any[] = [];
  /**
   * Array of the actual position of each satellite
   */
  m_aoSatellitePositions: any[] = [];

  m_oFakePosition: any = null;
  m_oUfoPointer: any;
  m_aoSateliteInputTraks: any[] = [];

  m_bLoadingWSFiles: boolean = false;

  /**
   * List of the products in the selected workspace
   */
  m_aoProducts: Array<any> = [];

  /**
   * View Model of the selected workspace
   */
  m_oWorkspaceViewModel: any;

  /**
   * If a workspace is selected, if a product is selected, is hooked here
   */
  m_oSelectedProduct: any;

  /**
   * Filter to the workspace list
   */
  m_sWorkspaceSearchInput: string = '';

  /**
   * Available sorting options
   */
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

  /**
   * Actual Sorting Option
   */
  m_oActiveSortingOption: any = {}

  m_oSelectedWorkspace: any = {}

  /**
   * Flag to know if the component has been destroyed.
   * It is used in case we receive "old" callbacks after the page changed
   */
  m_bDestroyCalled = false;

  m_aoSelectedWorkspaces: Array<Workspace> = [];
  constructor(

    private m_oGlobeService: GlobeService,
    private m_oOpportunitySearchService: OpportunitySearchService,
    private m_oProductService: ProductService,
    ) { }


  ngOnInit(): void {
    this.m_bDestroyCalled = false;
    this.m_oGlobeService.initRotateGlobe('CesiumContainer3');
    this.getTrackSatellite();
    this.m_bShowSatellites = true;

    this.m_oSetIntervalReference = setInterval(() => {
      this.updateSatellitesPositions();
    }, 15000)
  }

  ngOnDestroy(): void {
    this.m_bDestroyCalled = true;

    //Destroy Interval after closing:
    if (this.m_oSetIntervalReference) {
      clearInterval(this.m_oSetIntervalReference);
    }

    this.m_oGlobeService.clearGlobe()
  }

  /**
   * The user clicked on a workspace
   * @param oWorkspace
   */
  onShowWorkspace(oWorkspace: Workspace) {

    this.m_oGlobeService.removeAllEntities();
    this.loadProductList(oWorkspace)
  }

  /**
   * Refresh the list of the products in the Properties section
   */
  loadProductList(oWorkspace: Workspace) {
    this.m_bLoadingWSFiles = true;

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) === true) {
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.workspaceId) === true) {
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveWorkspace) === false) {
      this.m_oActiveWorkspace.workspaceId = oWorkspace.workspaceId;
    }

    let oWorkspaceId = oWorkspace.workspaceId;

    this.m_oProductService.getProductLightListByWorkspace(oWorkspaceId).subscribe({
      next: oResponse => {

        if (this.m_bDestroyCalled) return;

        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoProducts = [];
          for (let iIndex = 0; iIndex < oResponse.length; iIndex++) {
            this.m_aoProducts.push(oResponse[iIndex]);
          }
        }
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProducts) || this.m_aoProducts.length == 0) {
          FadeoutUtils.verboseLog("WorkspacesComponent.loadProductList No products to show")
        } else {
          //add globe bounding box
          this.m_oGlobeService.addAllWorkspaceRectanglesOnGlobe(this.m_aoProducts);
        }

        this.m_bLoadingWSFiles = false;
      },
      error: oError => { }
    });
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

  getTrackSatellite() {
    let iSat = 0;

    this.m_aoSatelliteInputTracks = this.m_oGlobeService.getSatelliteTrackInputList();

    //Remove all old Entities from the map:
    this.m_oGlobeService.removeAllEntities();

    for (let iSat = 0; iSat < this.m_aoSatelliteInputTracks.length; iSat++) {
      let oActualSat = this.m_aoSatelliteInputTracks[iSat];

      this.m_oOpportunitySearchService.getTrackSatellite(this.m_aoSatelliteInputTracks[iSat].name).subscribe(oResponse => {
        if (oResponse) {

          if (oResponse.currentPosition) {
            for (let iOriginalSat = 0; iOriginalSat < this.m_aoSatelliteInputTracks.length; iOriginalSat++) {
              if (this.m_aoSatelliteInputTracks[iOriginalSat].name === oResponse.code) {
                oActualSat = this.m_aoSatelliteInputTracks[iOriginalSat];
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
                aoMoonPosition[2] = 384400000;

                this.m_oGlobeService.drawPointWithImage(aoMoonPosition, "assets/icons/sat_death.svg", "Moon", "-");
              }
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

    this.m_aoSatelliteInputTracks = this.m_oGlobeService.getSatelliteTrackInputList();

    this.updatePosition();

    return true;
  }

  updatePosition() {
    let sSatellites: string = "";
    for (let iSat = 0; iSat < this.m_aoSatelliteInputTracks.length; iSat++) {
      sSatellites += this.m_aoSatelliteInputTracks[iSat].name + "-";
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
    for (let iOriginalSat = 0; iOriginalSat < this.m_aoSatelliteInputTracks.length; iOriginalSat++) {
      if (this.m_aoSateliteInputTraks[iOriginalSat]) {
        if (this.m_aoSateliteInputTraks[iOriginalSat].name === sCode) {
          return iOriginalSat;
        }
      }

    }
    return -1;
  }

  getSelectedWorkspace(oEvent) {
    this.m_oSelectedWorkspace = oEvent;
    this.onShowWorkspace(this.m_oSelectedWorkspace);
  }

  // setSorting(oSortingOption) {
  //   let bIsDescending: boolean = false;
  //   let propertyName: string = '';
  //   //Set Active Sorting Option:
  //   if (FadeoutUtils.utilsIsObjectNullOrUndefined(oSortingOption) === false) {
  //     this.m_oActiveSortingOption = oSortingOption;
  //     oSortingOption.direction === 'asc' ? bIsDescending = true : bIsDescending = false;
  //     oSortingOption.column === 'date' ? propertyName = 'creationDate' : oSortingOption.column === 'workspace' ? propertyName = 'workspaceName' : propertyName = 'ownerUserId';
  //   }
  //   if (propertyName === 'ownerUserId' || propertyName === 'workspaceName') {
  //     this.m_aoWorkspacesList.sort((oWorkspace1: any, oWorkspace2: any) => {
  //       if (oWorkspace1[propertyName].toLowerCase() < oWorkspace2[propertyName].toLowerCase()) {
  //         return bIsDescending ? 1 : -1;
  //       }
  //       if (oWorkspace1[propertyName].toLowerCase() > oWorkspace2[propertyName].toLowerCase()) {
  //         return bIsDescending ? -1 : 1;
  //       }
  //       return 0;
  //     });
  //   }
  //   if (propertyName === 'creationDate') {
  //     this.m_aoWorkspacesList.sort((oWorkspace1: any, oWorkspace2: any) => {
  //       if (bIsDescending === true) {
  //         return <any>new Date(oWorkspace2[propertyName]) - <any>new Date(oWorkspace1[propertyName]);
  //       } else {
  //         return <any>new Date(oWorkspace1[propertyName]) - <any>new Date(oWorkspace2[propertyName]);
  //       }
  //     });
  //   }

  // }

  // selectAllWorkspaces(oEvent) {
  //   if (oEvent.checked === true) {
  //     this.m_aoWorkspacesList.forEach(oWorkspace => {
  //       oWorkspace['checked'] = true;
  //     })
  //     this.m_aoSelectedWorkspaces = this.m_aoWorkspacesList;
  //   } else if (oEvent.checked === false) {
  //     this.m_aoWorkspacesList.forEach(oWorkspace => {
  //       oWorkspace['checked'] = false;
  //     })
  //     this.m_aoSelectedWorkspaces = [];
  //   }
  // }

  // getWorkspaceSelectionChange(oEvent) {
  //   if (oEvent.checked === true) {
  //     this.m_aoSelectedWorkspaces.push(oEvent);
  //   } else if (oEvent.checked === false) {
  //     this.m_aoSelectedWorkspaces = this.m_aoSelectedWorkspaces.filter(oWorkspace => oWorkspace.workspaceId !== oEvent.workspaceId)
  //   }
  // }

  // deleteMultipleWorkspaces() {
  //   let sConfirmMsg = `Are you sure you want to delete ${this.m_aoSelectedWorkspaces.length} workspaces?`;
  //   let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg);
  //   bConfirmResult.subscribe(oDialogResult => {
  //     if (oDialogResult === true) {
  //       this.m_aoSelectedWorkspaces.forEach((oWorkspace, iIndex) => {
  //         if(oWorkspace.workspaceId === this.m_oActiveWorkspace.workspaceId) {
  //           this.m_oActiveWorkspace = null;
  //         }
  //         this.m_oWorkspaceService.deleteWorkspace(oWorkspace, true, true).subscribe({
  //           next: oResponse => {
  //             this.m_oNotificationDisplayService.openSnackBar(`Removed ${oWorkspace.workspaceName}`, "Close", "right", "bottom");
  //             if (iIndex === this.m_aoSelectedWorkspaces.length - 1) {
  //             }
  //           },
  //           error: oError => {
  //             this.m_oNotificationDisplayService.openAlertDialog(`Error in deleting ${oWorkspace.workspaceName}`);
  //           }
  //         })
  //       })
  //     }
  //   })
  // }
}
