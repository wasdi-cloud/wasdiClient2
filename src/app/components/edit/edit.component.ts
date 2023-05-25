import { Component, OnInit } from '@angular/core';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { Product } from 'src/app/shared/models/product.model';
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MapService } from 'src/app/services/map.service';
import { GlobeService } from 'src/app/services/globe.service';
import { FileBufferService } from 'src/app/services/api/file-buffer.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oFileBufferService: FileBufferService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService,
    private m_oProductService: ProductService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessWorkspaceService: ProcessWorkspaceServiceService,
    private m_oRouter: Router,
    private m_oTranslateService: TranslateService,
    private m_oWorkspaceService: WorkspaceService) {

  }
  //Map Status: 2D (true) or 3D (false): 
  m_b2DMapModeOn: boolean = true;
  //Has first zoom on band been done? 
  m_bFirstZoomOnBandDone: boolean = false;

  //Query Search filter text (product tree): 
  m_sTextQueryFilter: string = '';
  m_bIsFilteredTree: false;

  m_bTreeIsLoading: boolean = true;


  //Array of Products in Workspace
  m_aoProducts: Product[];

  //WorkspaceId is necessary. If null, create a new one.
  m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
  m_oActiveWorkspace: any;

  // Actual User
  m_oUser = this.m_oConstantsService.getUser();
  //{}
  m_aoProductsLayersIn3DMapArentGeoreferenced = [];
  //default sort by value
  sSortType = 'default';

  //boolean value for Jupyter Notebook 
  m_bNotebookIsReady = false;

  //Array for Processes
  m_aoProcessesRunning: any[] = []

  m_sSearchString: string;

  m_aoVisibleBands

  ngOnInit(): void {
    //Initalize the map

    //add the GeoSearch Plugin Bar

    //Initalize the globe


    //What to do if workspace undefined: 
    if (!this.m_sWorkspaceId) {
      //Check route for workspace id
      if (this.m_oActivatedRoute.snapshot.params['workspaceId']) {
        //Assign and set new workspace id
        this.m_sWorkspaceId = this.m_oActivatedRoute.snapshot.params['workspaceId']
        this.m_oWorkspaceService.getWorkspaceEditorViewModel(this.m_sWorkspaceId).subscribe(oResponse => {
          this.m_oConstantsService.setActiveWorkspace(oResponse);
          this.m_oActiveWorkspace = oResponse;

          //Workspace is now defined => Load Processes
          this.getProcesses()
        })
      } else {
        //If unable to identify workspace, re-route to workspaces tab
        this.m_oRouter.navigateByUrl('/workspaces')
      }
    } else {
      //If workspace is defined => Load Processes
      this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
      this.getProcesses()
    }

    //load Products
    this.getProductList();

  }

  getProductList() {
    this.m_oProductService.getProductListByWorkspace(this.m_sWorkspaceId).subscribe(response => {
      this.m_aoProducts = response
      console.log(this.m_aoProducts)
    })
  }

  getProcesses() {
    this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_sWorkspaceId).subscribe(response => {
      this.m_aoProcessesRunning = response;
    })
  }

  getSearchString(event: string) {
    this.m_sSearchString = event;
  }

  getVisibleBands(event: any) {
    this.m_aoVisibleBands = event;
  }

  getMapMode(event: any) {
    this.m_b2DMapModeOn = event;
  }
}
