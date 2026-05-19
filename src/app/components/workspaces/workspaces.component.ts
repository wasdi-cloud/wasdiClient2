import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/api/product.service';
import { MapEngineService } from 'src/app/services/map-engine/map-engine.service';


//Import Models:;
import { Workspace } from 'src/app/shared/models/workspace.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

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
    host: { 'class': 'flex-fill' },
    standalone: false
})

export class WorkspacesComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Array of available workspaces
   */
  m_aoWorkspacesList: Workspace[] = []

  /**
   * Workspace actually seletected
   */
  m_oActiveWorkspace!: WorkspaceViewModel;

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

  private readonly m_sWorkspaceMapId = 'workspacesMap';
  private m_aoWorkspaceRectangles: any[] = [];
  private m_iWorkspaceRenderToken = 0;

  constructor(
    private m_oMapEngineService: MapEngineService,
    private m_oProductService: ProductService,
    ) { }


  ngOnInit(): void {
    this.m_bDestroyCalled = false;
  }

  ngAfterViewInit(): void {
    this.initWorkspaceMap();
  }

  ngOnDestroy(): void {
    this.m_bDestroyCalled = true;
    this.m_oMapEngineService.clearMap();
  }

  private initWorkspaceMap(): void {
    this.m_oMapEngineService.initMap(this.m_sWorkspaceMapId);
    const oMap = this.m_oMapEngineService.getMap();
    if (oMap?.dragRotate?.disable) oMap.dragRotate.disable();
    if (oMap?.touchZoomRotate?.disableRotation) oMap.touchZoomRotate.disableRotation();
    this.forceMapResize();
  }

  private forceMapResize(): void {
    const oMap = this.m_oMapEngineService.getMap();
    if (!oMap?.resize) {
      return;
    }

    // Run a couple of delayed resizes to handle route transitions/layout settling.
    setTimeout(() => oMap.resize(), 0);
    setTimeout(() => oMap.resize(), 120);
  }

  private renderWorkspaceFootprints(): void {
    let oMap = this.m_oMapEngineService.getMap();
    if (!oMap) {
      this.initWorkspaceMap();
      oMap = this.m_oMapEngineService.getMap();
    }

    this.m_iWorkspaceRenderToken += 1;
    const iRenderToken = this.m_iWorkspaceRenderToken;

    for (const oRectangle of this.m_aoWorkspaceRectangles) {
      this.m_oMapEngineService.removeLayerFromMap(oRectangle);
    }
    this.m_aoWorkspaceRectangles = [];

    if (!Array.isArray(this.m_aoProducts) || this.m_aoProducts.length === 0) {
      return;
    }

    const fDrawFootprints = () => {
      if (this.m_bDestroyCalled || iRenderToken !== this.m_iWorkspaceRenderToken) {
        return;
      }

      this.m_oMapEngineService.addAllWorkspaceRectanglesOnMap(this.m_aoProducts, '');
      this.m_aoWorkspaceRectangles = this.m_aoProducts
        .map((oProduct: any) => oProduct?.rectangle)
        .filter((oRectangle: any) => !!oRectangle);
      this.m_oMapEngineService.flyToWorkspaceBoundingBox(this.m_aoProducts);
      this.forceMapResize();
    };

    const bStyleLoaded = !!(oMap?.isStyleLoaded?.() || oMap?.loaded?.());
    if (bStyleLoaded) {
      fDrawFootprints();
      return;
    }

    if (oMap?.once) {
      oMap.once('load', fDrawFootprints);
    }
  }

  /**
   * The user clicked on a workspace
   * @param oWorkspace
   */
  onShowWorkspace(oWorkspace: Workspace) {
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

        if (Array.isArray(oResponse)) {
          this.m_aoProducts = [...oResponse];
        } else {
          this.m_aoProducts = [];
        }

        if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoProducts) || this.m_aoProducts.length == 0) {
          FadeoutUtils.verboseLog("WorkspacesComponent.loadProductList No products to show")
        }

        this.renderWorkspaceFootprints();

        this.m_bLoadingWSFiles = false;
      },
      error: oError => {
        this.m_bLoadingWSFiles = false;
      }
    });
    return true;
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
