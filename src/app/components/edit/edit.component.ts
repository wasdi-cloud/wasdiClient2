import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

//Service Imports:
import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { GlobeService } from 'src/app/services/globe.service';
import { MapService } from 'src/app/services/map.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { NotificationsQueueService } from 'src/app/services/notifications-queue.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { WorkspaceInfoDialogComponent } from './workspace-info-dialog/workspace-info-dialog.component';

//Model Imports:
import { Product } from 'src/app/shared/models/product.model';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import WasdiUtils from 'src/app/lib/utils/WasdiJSUtils';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  host: { 'class': 'flex-fill' }
})
export class EditComponent implements OnInit, OnDestroy {

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oClipboard: Clipboard,
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oNotificationsQueueService: NotificationsQueueService,
    private m_oProductService: ProductService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oRouter: Router,
    private m_oTitleService: Title,
    private m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
    private m_oGlobeService: GlobeService,
    private m_oMapService: MapService) { }

  /**
   * Map Status: 2D (true) or 3D (false):
   */
  m_b2DMapModeOn: boolean = true;

  /**
   * Has first zoom on band been done?
   */
  m_bFirstZoomOnBandDone: boolean = false;

  /**
   * Query Search filter text (product tree):
   */
  m_sTextQueryFilter: string = '';
  /**
   * Flag to understand if the tree is applying a filter or not
   */
  m_bIsFilteredTree: false;

  /**
   * Flag to detect if the tree is loading
   */
  m_bTreeIsLoading: boolean = true;

  /**
   * Flag to define if Jupyter is ready or not
   */
  m_bJupyterIsReady: boolean = false;

  /**
   * Array of Products in Workspace
   */
  m_aoProducts: Product[] = [];

  /**
   * WorkspaceId is necessary. If null, create a new one.
   */
  m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;

  /**
   * Local reference to Active Workspace
   */
  m_oActiveWorkspace: any;

  /**
   * Actual User
   */
  m_oUser = this.m_oConstantsService.getUser();

  /**
   * default sort by value
   */
  sSortType = 'default';

  /**
   * Array for Processes in the workspace
   */
  m_aoProcessesRunning: any[] = []

  /**
   * List of visible bands
   */
  m_aoVisibleBands = [];

  /**
   * Flag to know if it is loading products
   */
  m_bIsLoadingProducts: boolean = true;

  /**
   * Name of the product in download
   */
  m_sDownloadProductName: string = "";

  /**
   * Flag to show or not the product in download
   */
  m_bShowProductDownload: boolean = false;

  /**
   * Length of filtered products received from products list
   */
  m_iFilteredProducts: number = 0;

  ngOnInit(): void {
    //What to do if workspace undefined:
    if (!this.m_oActiveWorkspace) {

      //Check route for workspace id
      if (this.m_oActivatedRoute.snapshot.params['workspaceId']) {
        //Assign and set new workspace id
        this.m_sWorkspaceId = this.m_oActivatedRoute.snapshot.params['workspaceId']
        this.openWorkspace(this.m_sWorkspaceId);
      }
      else {
        //If unable to identify workspace, re-route to workspaces tab
        this.m_oRouter.navigateByUrl('/workspaces')
      }
    }
    else {
      //If workspace is defined => Load Processes
      this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
      this.m_oTitleService.setTitle(`WASDI 2.0 - ${this.m_oActiveWorkspace.name}`)
      this._subscribeToRabbit();
      //load Products
      this.getProductList();
    }

    this.m_oRabbitStompService.setMessageCallback(this.receivedRabbitMessage);
    this.m_oRabbitStompService.setActiveController(this);
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.unsubscribe();
    this.m_oGlobeService.clearGlobe();
    this.m_oMapService.clearMap();
  }

  receivedRabbitMessage(oMessage, oController) {
    // Check if the message is valid
    if (oMessage == null) return;

    // Check the Result
    if (oMessage.messageResult == "KO") {

      let sOperation = "null";
      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.messageCode) === false) sOperation = oMessage.messageCode;

      let sErrorDescription = "";

      if (FadeoutUtils.utilsIsStrNullOrEmpty(oMessage.payload) === false) sErrorDescription = oMessage.payload;
      if (FadeoutUtils.utilsIsStrNullOrEmpty(sErrorDescription) === false) sErrorDescription = "<br>" + sErrorDescription;

      oController.m_oNotificationDisplayService.openAlertDialog(oController.m_oTranslate.instant("MSG_ERROR_IN_OPERATION_1") + `<li>${sOperation}</li>` + sErrorDescription, 10000);

        if (!FadeoutUtils.utilsIsStrNullOrEmpty(sErrorDescription)) {
            // let oAudio = new Audio('assets/audio/message.wav');
            // oAudio.play();            
            let oUserMessage = {
                ...oMessage,
                displayMessage: sErrorDescription,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                seen: false
            }
            oController.m_oNotificationsQueueService.setNotifications(oUserMessage);
        }


      return;
    }

    // Switch the Code
    switch (oMessage.messageCode) {
      case "PUBLISH":
        break;
      case "PUBLISHBAND":
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
        oController.getProductList();
        break;
    }

    // Set the notification
    // if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oMessage.payload)) {
    //   //Ensure the payload is a string (can be a product object)
    //   if (typeof oMessage.payload === 'string' && oMessage.payload.includes("DONE")) {
    //     oController.m_oNotificationsQueueService.setNotifications(oMessage);
    //   }
    // }

    WasdiUtils.utilsProjectShowRabbitMessageUserFeedBack(oMessage, oController.m_oTranslate, oController);
  }

  receivedNewProductMessage(oMessage) {
    let sMessage = this.m_oTranslate.instant("MSG_EDIT_PRODUCT_ADDED");
    // Alert the user
    this.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar');
    // Update product list
    this.getProductList();

  };

  _subscribeToRabbit() {
    if (this.m_oRabbitStompService.isSubscrbed() == false && !FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveWorkspace)) {
      let _this = this;
      this.m_oRabbitStompService.waitServiceIsReady()
      console.log('EditorController: Web Stomp is ready --> subscribe');
      _this.m_oRabbitStompService.subscribe(_this.m_oActiveWorkspace.workspaceId);
    }
  }

  /**
   * Open a Workspace. Call the get Workspace Editor View Model
   * If all is ok, it set the Active Workspace, subscribe to rabbit and get the full product list
   * @param sWorkspaceId
   */
  openWorkspace(sWorkspaceId: string) {
    this.m_oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          if (oResponse.workspaceId === null || oResponse.activeNode === false) {
            this.m_oRouter.navigateByUrl('/workspaces');
            let sMessage = this.m_oTranslate.instant("MSG_FORBIDDEN")
            this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'danger')
          }
          else {
            this.m_oConstantsService.setActiveWorkspace(oResponse);
            this.m_oActiveWorkspace = oResponse;

            this.m_oTitleService.setTitle(`WASDI 2.0 - ${this.m_oActiveWorkspace.name}`)

            this._subscribeToRabbit();
            this.getProductList();

            this.getJupyterIsReady(this.m_oActiveWorkspace.workspaceId);
          }
        }
      },
      error: oError => {
        let sMessage = this.m_oTranslate.instant("MSG_ERROR_READING_WS");
        this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'danger');
      }
    })
  }

  getProductList() {
    this.m_oProductService.getProductListByWorkspace(this.m_sWorkspaceId).subscribe({
      next: oResponse => {
        this.m_aoProducts = oResponse;
        this.m_iFilteredProducts = this.m_aoProducts.length
        this.m_bIsLoadingProducts = false;
      },
      error: oError => {

      }
    })
  }

  getJupyterIsReady(sWorkspaceId) {
    let sErrorMsg = this.m_oTranslate.instant("EDITOR_ERROR_CONSOLE_STATUS_FAIL");
    this.m_oConsoleService.isConsoleReady(sWorkspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === true) {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
          return false;
        }
        this.m_bJupyterIsReady = oResponse.boolValue;
        return true;
      },
      error: oError => { }
    })
  }

  getVisibleBands(event: any) {
    if (event.visibleBands) {
      // When handling from Nav/layers component:
      this.m_aoVisibleBands = event.visibleBands;
      this.setPublishedSetting(event.removedBand);
    } else {
      //When handling from Products List:p
      this.m_aoVisibleBands = event;
    }
  }

  getMapMode(event: any) {
    this.m_b2DMapModeOn = event;
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
    if (oEvent) {
      this.getProductList();
    }
  }

  getProductDownloadStatus(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {

      if (oEvent.downloadStatus === 'incomplete') {
        this.m_bShowProductDownload = true;
        this.m_sDownloadProductName = oEvent.productName;
        // this.m_oNotificationDisplayService.openSnackBar("Downloading ..", 'Downloading ..', 'success-snackbar');

      } else {
        this.m_bShowProductDownload = false;
      }
    }
  }

  setPublishedSetting(oInputBand) {
    this.m_aoProducts.forEach(oProduct => {
      if (oProduct.name === oInputBand.productName) {
        oProduct.bandsGroups.bands.forEach(oBand => {
          if (oBand.name === oInputBand.name) {
            oBand.published = false;
          }
        })
      }
    })
  }

  copyWorkspaceId() {
    let sCopiedMsg = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD");
    this.m_oClipboard.copy(this.m_sWorkspaceId);
    this.m_oNotificationDisplayService.openSnackBar(sCopiedMsg, '', 'success-snackbar');
  }

  copyWorkspaceName() {
    let sCopiedMsg = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD");
    this.m_oClipboard.copy(this.m_oActiveWorkspace?.name);
    this.m_oNotificationDisplayService.openSnackBar(sCopiedMsg, '', 'success-snackbar');
  }

  openPropertiesDialog() {
    this.m_oDialog.open(WorkspaceInfoDialogComponent, {
      height: '65vh',
      width: '60vw'
    })
  }

  navigateToWorkspaces() {
    this.m_oRouter.navigateByUrl('/workspaces')
  }

  getFilteredProductsLength(oEvent) {
    this.m_iFilteredProducts = oEvent;
  }
}
