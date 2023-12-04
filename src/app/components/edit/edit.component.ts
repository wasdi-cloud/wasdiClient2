import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

//Service Imports: 
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Model Imports: 
import { Product } from 'src/app/shared/models/product.model';

//Utilities Imports: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oConstantsService: ConstantsService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProductService: ProductService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oRouter: Router,
    private m_oTitleService: Title,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
    private m_oGlobeService: GlobeService) { }

  //Map Status: 2D (true) or 3D (false): 
  m_b2DMapModeOn: boolean = true;
  //Has first zoom on band been done? 
  m_bFirstZoomOnBandDone: boolean = false;

  //Query Search filter text (product tree): 
  m_sTextQueryFilter: string = '';
  m_bIsFilteredTree: false;

  m_bTreeIsLoading: boolean = true;

  //Array of Products in Workspace
  m_aoProducts: Product[] = [];

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

  m_aoVisibleBands = [];

  m_bIsLoadingProducts: boolean = true;

  m_iHookIndex: any;

  m_sDownloadProductName: string = "";
  m_bShowProductDownload: boolean = false;

  ngOnInit(): void {
    console.log("EditComponent.ngOnInit")

    //RabbitStomp Service Call
    this.m_oRabbitStompService.addMessageHook("LAUNCHJUPYTERNOTEBOOK",
      this,
      this.rabbitMessageHook)

    //What to do if workspace undefined: 
    if (!this.m_oActiveWorkspace) {
      //Check route for workspace id
      if (this.m_oActivatedRoute.snapshot.params['workspaceId']) {
        //Assign and set new workspace id
        this.m_sWorkspaceId = this.m_oActivatedRoute.snapshot.params['workspaceId']

        console.log("edit.component.ngOnInit: call open Workspace ")

        this.openWorkspace(this.m_sWorkspaceId);
      }
      else {
        //If unable to identify workspace, re-route to workspaces tab
        this.m_oRouter.navigateByUrl('/workspaces')
      }
    } else {
      //If workspace is defined => Load Processes
      this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
      this.m_oTitleService.setTitle(`WASDI 2.0 - ${this.m_oActiveWorkspace.name}`)
      this._subscribeToRabbit();
      //load Products
      this.getProductList();
    }

    this.m_oRabbitStompService.setMessageCallback(this.recievedRabbitMessage);
    this.m_oRabbitStompService.setActiveController(this);
  }

  recievedRabbitMessage(oMessage, oController) {
    // Check if the message is valid
    if (oMessage == null) return;

    // Check the Result
    if (oMessage.messageResult == "KO") {

      var sOperation = "null";
      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.messageCode) === false) sOperation = oMessage.messageCode;

      var sErrorDescription = "";

      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.payload) === false) sErrorDescription = oMessage.payload;
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sErrorDescription) === false) sErrorDescription = "<br>" + sErrorDescription;

      oController.m_oNotificationDisplayService.openAlertDialog(oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_1") + sOperation + oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_2") + sErrorDescription);

      if (oMessage.messageCode == "PUBLISHBAND") {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload) == false) {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload.productName) == false && FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload.bandName) == false) {
            // var sNodeName = oMessage.payload.productName + "_" + oMessage.payload.bandName;
            // this.setTreeNodeAsDeselected(sNodeName);
          }
        }
      }

      return;
    }

    // Switch the Code
    switch (oMessage.messageCode) {
      case "PUBLISH":
        oController.receivedPublishMessage(oMessage);
        break;
      case "PUBLISHBAND":
        oController.receivedPublishBandMessage(oMessage);
        break;
      case "DOWNLOAD":
      case "GRAPH":
      case "INGEST":
      case "MOSAIC":
      case "SUBSET":
      case "MULTISUBSET":
      case "RASTERGEOMETRICRESAMPLE":
      case "REGRID":
      case "SHARE":
        oController.receivedNewProductMessage(oMessage);
        break;
      case "DELETE":
        //oController.getProductListByWorkspace();
        break;
    }

    WasdiUtils.utilsProjectShowRabbitMessageUserFeedBack(oMessage, oController.m_oTranslate, oController);
  }

  receivedNewProductMessage(oMessage) {

    let sMessage = this.m_oTranslate.instant("MSG_EDIT_PRODUCT_ADDED");

    // Alert the user
    this.m_oNotificationDisplayService.openSnackBar(sMessage, "Close", "right", "bottom");

    // Update product list
    this.getProductList();

  };

  receivedPublishMessage(oMessage) {
    if (oMessage == null) {
      return;
    }
    if (oMessage.messageResult == "KO") {
      let sMessage = this.m_oTranslate.instant("MSG_PUBLISH_ERROR");
      this.m_oNotificationDisplayService.openAlertDialog(sMessage);
      return;
    }
  };
  ngOnDestroy(): void {
    console.log("EditComponent.ngOnInit")
    this.m_oRabbitStompService.unsubscribe();
    this.m_oGlobeService.clearGlobe();
  }

  _subscribeToRabbit() {
    if (this.m_oRabbitStompService.isSubscrbed() == false && !FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveWorkspace)) {
      let _this = this;
      this.m_oRabbitStompService.waitServiceIsReady()
      console.log('EditorController: Web Stomp is ready --> subscribe');
      _this.m_oRabbitStompService.subscribe(_this.m_oActiveWorkspace.workspaceId);
    }
  }

  openWorkspace(sWorkspaceId: string) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (oResponse.workspaceId === null || oResponse.activeNode === false) {
            this.m_oRouter.navigateByUrl('/workspaces');
            let sMessage = this.m_oTranslate.instant("MSG_FORBIDDEN")
            this.m_oNotificationDisplayService.openAlertDialog(sMessage)
          } else {

            console.log("edit.component.ngOnInit: Received open Workspace View Model ")

            this.m_oConstantsService.setActiveWorkspace(oResponse);
            this.m_oActiveWorkspace = oResponse;
            this._subscribeToRabbit();

            console.log("edit.component.ngOnInit: CALL get product list ")

            this.getProductList();
            this.m_oTitleService.setTitle(`WASDI 2.0 - ${this.m_oActiveWorkspace.name}`)
          }
        }
      },
      error: oError => {
        let sMessage = this.m_oTranslate.instant("MSG_ERROR_READING_WS");
        this.m_oNotificationDisplayService.openAlertDialog(sMessage);
      }
    })
  }

  getProductList() {
    this.m_oProductService.getProductListByWorkspace(this.m_sWorkspaceId).subscribe({
      next: oResponse => {
        console.log("edit.component.ngOnInit: RECEIVED got the product list ")
        this.m_aoProducts = oResponse
        this.m_bIsLoadingProducts = false;
      },
      error: oError => {

      }
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
    this.getProductList();
    if (oEvent) {
      this.getProductList();
    }
  }

  getProductDownloadStatus(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {

      if (oEvent.downloadStatus === 'incomplete') {
        this.m_bShowProductDownload = true;
        this.m_sDownloadProductName = oEvent.productName;
      } else {
        this.m_bShowProductDownload = false;
      }
    }
  }

  rabbitMessageHook(oRabbitMessage, oController) {
    console.log(oRabbitMessage);
  }
}
