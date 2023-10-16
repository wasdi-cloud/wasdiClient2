import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Service Imports: 
import { ConstantsService } from 'src/app/services/constants.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Model Imports: 
import { Product } from 'src/app/shared/models/product.model';

//Utilities Imports: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oProductService: ProductService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oRouter: Router,
    private m_oTitleService: Title,
    private m_oTranslateService: TranslateService,
    private m_oWorkspaceService: WorkspaceService) { }
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

  m_aoVisibleBands;

  ngOnInit(): void {
    //What to do if workspace undefined: 
    if (!this.m_oActiveWorkspace) {
      //Check route for workspace id
      if (this.m_oActivatedRoute.snapshot.params['workspaceId']) {
        //Assign and set new workspace id
        this.m_sWorkspaceId = this.m_oActivatedRoute.snapshot.params['workspaceId']
        this.openWorkspace(this.m_sWorkspaceId);
        
      } else {
        //If unable to identify workspace, re-route to workspaces tab
        this.m_oRouter.navigateByUrl('/workspaces')
      }
    } else {
      //If workspace is defined => Load Processes
      this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
      this.m_oTitleService.setTitle(this.m_oActiveWorkspace.name)
      this.subscribeToRabbit();
    }

    //load Products
    this.getProductList();
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.unsubscribe();
    this.m_oTitleService.setTitle("WASDI 2.0")
  }

  openWorkspace(sWorkspaceId: string) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (oResponse.workspaceId === null || oResponse.activeNode === false) {
            this.m_oRouter.navigateByUrl('/workspaces');
            let sMessage = this.m_oTranslateService.instant("MSG_FORBIDDEN")
            this.m_oAlertDialog.openDialog(4000, sMessage)
          } else {
            this.m_oConstantsService.setActiveWorkspace(oResponse);
            this.m_oActiveWorkspace = oResponse;
            this.subscribeToRabbit();
            this.getProductList();
            this.m_oTitleService.setTitle(this.m_oActiveWorkspace.name)
          }
        }
      },
      error: oError => {
        let sMessage = this.m_oTranslateService.instant("MSG_ERROR_READING_WS");
        this.m_oAlertDialog.openDialog(4000, sMessage);
      }
    })
  }

  getProductList() {
    this.m_oProductService.getProductListByWorkspace(this.m_sWorkspaceId).subscribe(response => {
      this.m_aoProducts = response
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

  getProductListUpdate(event: any) {
    this.getProductList();
  }

  subscribeToRabbit() {
    if (this.m_oRabbitStompService.isSubscrbed() === false && !FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveWorkspace)) {
      console.log('EditorController: Web Stomp is ready --> subscribe');
      this.m_oRabbitStompService.subscribe(this.m_oActiveWorkspace.workspaceId);
    }
  }

  /**
   * Listen for changes in Product Information from the Product Tree:
   */
  getProductsChange(oEvent: any) {
    if(oEvent === true) {
      this.getProductList();
    }
  }
}
