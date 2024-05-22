import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import API services
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';

import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent, ErrorDialogModel } from 'src/app/shared/dialogs/error-dialog/error-dialog.component';

//Import models
import { TranslateService } from '@ngx-translate/core';
import { WapDirective } from 'src/app/directives/wap.directive';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { NewAppDialogComponent } from '../edit/edit-toolbar/toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { WapDisplayComponent } from './wap-display/wap-display.component';
import { JsonEditorService } from 'src/app/services/json-editor.service';

export interface Application {
  buyed: boolean,
  friendlyName: string,
  imgLink: string,
  isMine: boolean,
  price: number,
  processorDescription: string,
  processorId: string,
  processorName: string,
  publisher: string,
  score: number,
  votes: number,
}
@Component({
  selector: 'app-app-ui',
  templateUrl: './app-ui.component.html',
  styleUrls: ['./app-ui.component.css'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(500 + 'ms ease-in')),
      transition('true => false', animate(500 + 'ms ease-out'))
    ])
  ],
  host: { "class": "flex-fill" }
})
export class AppUiComponent implements OnInit {
  @ViewChild(WapDirective, { static: true }) appWap!: WapDirective;
  @ViewChildren(WapDisplayComponent) wapDisplayComponent: QueryList<WapDisplayComponent>;
  @ViewChild('editor') m_oEditorRef!: ElementRef;

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oJsonEditorService: JsonEditorService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessorWorkspaceService: ProcessWorkspaceService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private oWorkspaceService: WorkspaceService) { }

  /**
   * Processor Name
   */
  m_sProcessorName: string = this.m_oConstantsService.getSelectedApplication();

  /**
   * Processor View Model
   */
  m_oProcessorInformation: any = {} as Application;

  /**
   * Workspace control to define where to run the processor
   */
  m_oWorkspaceForm: any = {
    sNewWorkspaceName: null,
    sExistingWorkspace: null
  }

  /**
   * Collapsible elements 
   */
  m_bIsCollapsed: boolean = true;

  /**
   * Text for the help tab
   */
  m_sHelpHtml: string = "<p>No Help Provided</p>";

  /**
   * Processor History
   */
  m_aoProcessorHistory: any = []

  /**
   * Processor JSON string
   */
  m_sJSONParam = "{}";

  /**
   * Flag to know if all inputs must be rendered as strings or as objects
   */
  m_bRenderAsStrings: boolean = false;

  /**
   * Array of View Element Objects
   */
  m_aoViewElements: {}[] = [];

  /**
   * Array of names for the Tabs
   */
  m_aoTabs: any[] = [];

  /**
   * Active Tab Element
   */
  m_sActiveTab: string = ""

  /**
   * User's existing workspaces
   */
  m_aoExistingWorkspaces: Workspace[] = [];

  /**
   * Selected Workspace Name: 
   */
  m_oSelectedWorkspace: Workspace | null | undefined = null;

  /**
   * Error Message
   */
  m_sMessage = "The following inputs are required:"

  /**
   * User ID
   */
  m_sUserId: string;

  /**
   * Has the app been purchased?
   */
  m_bIsPurchased: boolean = true;

  m_oAppPaymentVM: any = {}

  ngOnInit(): void {
    // Take our user id
    this.m_sUserId = this.m_oConstantsService.getUser().userId;

    // Get the list of avaiable workspaces
    this.fetchWorkspaces();

    // We really should have a processor name
    if (this.m_sProcessorName) {
      // Read the View Model and the user interface
      this.getProcessorDetails(this.m_sProcessorName);
      this.getProcessorUI(this.m_sProcessorName);
    }
    else if (this.m_oActivatedRoute.snapshot.params['processorName']) {
      // Get the name from the route!
      this.m_sProcessorName = this.m_oActivatedRoute.snapshot.params['processorName'];
      this.m_oConstantsService.setSelectedApplication(this.m_sProcessorName);
      // Read the View Model and the user interface
      this.getProcessorDetails(this.m_sProcessorName);
      this.getProcessorUI(this.m_sProcessorName);
    }
    else {
      // This is a problem, we cannot proceed
      let oDialogData = new ErrorDialogModel("Error!", "Problem retrieving Processor Name");
      let oDialogRef = this.m_oDialog.open(ErrorDialogComponent, {
        maxWidth: '400px',
        data: oDialogData
      })
    }

    // Do we have an active workspace?
    // We select it
    if (this.m_oConstantsService.getActiveWorkspace() !== null) {
      this.m_oWorkspaceForm.sExistingWorkspace = this.m_oConstantsService.getActiveWorkspace();
    }

  }

  /**
   * Get Processor details from server
   */
  getProcessorDetails(sProcessorName: string) {
    return this.m_oProcessorService.getMarketplaceDetail(sProcessorName).subscribe(oResponse => {
      this.m_oProcessorInformation = oResponse;
      this.m_oProcessorService.getIsAppPurchased(this.m_oProcessorInformation.processorId).subscribe({
        next: oResponse => {
          this.m_bIsPurchased = oResponse;
          //Ensure owners aren't asked to buy their own apps
          if (this.m_oProcessorInformation.isMine === true) {
            this.m_bIsPurchased = true;
          }
        }
      })
    })
  }

  /**
   * Retrieve Processor UI from WASDI server
   */
  getProcessorUI(sApplicationName: string) {
    // Call the API to get the UI
    this.m_oProcessorService.getProcessorUI(sApplicationName).subscribe(oResponse => {

      // For all the tabs
      for (let iTabs = 0; iTabs < oResponse.tabs.length; iTabs++) {
        // Add it to the internal tab list
        let oTab = oResponse.tabs[iTabs];
        this.m_aoTabs.push(oTab);
        // We start selecting the first one by default
        if (iTabs === 0) {
          this.m_sActiveTab = oTab.name;
        }
      }

      // Get the render as strings flag
      if (oResponse.renderAsStrings) {
        if (oResponse.renderAsStrings !== null || oResponse.renderAsStrings !== undefined) {
          this.m_bRenderAsStrings = oResponse.renderAsStrings
        }
      }
    })
  }


  /**
   * Change Active Tab
   */
  getSelectedTab(sTab) {

    if (this.m_sActiveTab !== sTab) {
      this.m_sActiveTab = sTab;
    }

    if (sTab === 'help') {
      this.getHelpFromProcessor(this.m_sProcessorName);
    }

    if (sTab === 'history') {
      this.showHistory();
    }

    if (sTab === 'json') {
      this.showParamsJSON();
    }

  }

  /**
   * Retrieve the Help HTML
   */
  getHelpFromProcessor(sProcessorName: string) {
    this.m_oProcessorService.getHelpFromProcessor(sProcessorName).subscribe(response => {
      this.m_sHelpHtml = response.stringValue;
    })
  }

  /**
   * Load the history of this user with this application
   */
  showHistory() {
    this.m_oProcessorWorkspaceService.getProcessesByProcessor(this.m_sProcessorName).subscribe(response => {
      this.m_aoProcessorHistory = response
    })
  }

  /**
   * Get JSON parameters from the UI 
   */
  showParamsJSON() {
    let oProcessorInput = this.createParams();

    this.m_sJSONParam = JSON.stringify(oProcessorInput, null, 4)
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor()
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
  }

  /**
   * Run Application in either Selected Workspace or New Workspace
   */
  runApplication() {

    this.m_sMessage = "";
    let bCheck: boolean = this.checkParams();

    if (!bCheck) {
      this.m_oNotificationDisplayService.openAlertDialog(this.m_sMessage);
      return;
    }

    if (this.m_oWorkspaceForm.sNewWorkspaceName && this.m_oWorkspaceForm.sExistingWorkspace) {
      this.m_oNotificationDisplayService.openSnackBar("Either select workspace or create new one", "Close");
      return;
    }

    // let asMessages = [];
    let oProcessorInput = this.createParams();
    let oController = this;

    let sApplicationName: string = this.m_oConstantsService.getSelectedApplication();

    // If we are opening an existing workspace:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedWorkspace) === false) {
      this.oWorkspaceService.getWorkspaceEditorViewModel(this.m_oSelectedWorkspace.workspaceId).subscribe(oResponse => {
        if (oResponse) {
          this.executeProcessorInWorkspace(this, sApplicationName, oProcessorInput, oResponse);
        }
      });
    }
    else {
      let sWorkspaceName: string;
      let sUserProvidedWorkspaceName: string = this.m_oWorkspaceForm.sNewWorkspaceName;
      if (sUserProvidedWorkspaceName) {
        sWorkspaceName = this.m_oWorkspaceForm.sNewWorkspaceName;
      }
      else {
        let oToday = new Date();
        let sToday = oToday.toISOString();

        sWorkspaceName = sApplicationName + "_" + sToday;
      }
      //ERROR MESSAGES: 
      let sOpenError = this.m_oTranslate.instant("MSG_MKT_WS_OPEN_ERROR");
      let sCreateError = this.m_oTranslate.instant("MSG_MKT_WS_CREATE_ERROR");

      //Create a new Workspace
      this.oWorkspaceService.createWorkspace(sWorkspaceName).subscribe(oResponse => {
        let sWorkspaceId = oResponse.stringValue;

        if (sWorkspaceId === null) {
          this.m_oNotificationDisplayService.openAlertDialog(sCreateError)
        } else {
          this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe(response => {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
              this.m_oNotificationDisplayService.openAlertDialog(sOpenError);
            } else {
              this.executeProcessorInWorkspace(oController, sApplicationName, oProcessorInput, response);
            }
          })
        }
      })
    }
  }

  /**
   * Executes the processor in the given workspace
   * @param oController 
   * @param sApplicationName 
   * @param oProcessorInput 
   * @param oWorkspace 
   */
  executeProcessorInWorkspace(oController, sApplicationName: string, oProcessorInput, oWorkspace) {
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === true) {
      oController.m_oConstantsService.setActiveWorkspace(oWorkspace);
      oController.m_oProcessorService.runProcessor(sApplicationName, JSON.stringify(oProcessorInput)).subscribe(oResponse => {
        if (oResponse) {
          this.m_oRouter.navigateByUrl(`edit/${oWorkspace.workspaceId}`)
        }
      })
    }
  }

  /**
   * Get user's workspaces
   */
  fetchWorkspaces() {
    let oUser: User = this.m_oConstantsService.getUser();
    if (oUser !== {} as User) {
      this.oWorkspaceService.getWorkspacesInfoListByUser().subscribe(oResponse => {
        this.m_aoExistingWorkspaces = oResponse;
      })
    }
  }

  /**
   * Called to set the workspace where the user wants to run the app
   * @param oEvent Notification of the selection of a Workspace
   * @returns 
   */
  getSelectedWorkspaceId(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent)) {
      return false;
    }
    else {
      this.m_oSelectedWorkspace = oEvent;
      return true;
    }
  }

  checkParams() {
    let bIsValid: boolean = true;

    let asMessages: string[] = [];

    this.m_sMessage = "The following inputs are required or are invalid:"
    this.m_sMessage += "<br>";

    for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
      if (!this.wapDisplayComponent.get(iTabs)?.checkParams(asMessages)) {
        bIsValid = false;
      }
    }

    if (!bIsValid) {
      for (let iMessages = 0; iMessages < asMessages.length; iMessages++) {
        this.m_sMessage = this.m_sMessage + asMessages[iMessages] + "<br>";
      }

    }

    return bIsValid;
  }

  createParams() {
    let oProcessorInput = {};
    for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
      let oParamsObj = this.wapDisplayComponent.get(iTabs)?.createParams();

      if (oParamsObj !== undefined) {
        Object.keys(oParamsObj).forEach(key => {
          oProcessorInput[key] = oParamsObj?.[key]
        });
      }
    }
    return oProcessorInput;
  }

  setSelectedWorkspace(oEvent: any) {
    this.m_oWorkspaceForm.sExistingWorkspace = oEvent.value;
  }

  toggleCollapse() {
    this.m_bIsCollapsed = !this.m_bIsCollapsed;
  }

  marketplaceReturn() {
    this.m_oRouter.navigateByUrl(`${this.m_sProcessorName}/appDetails`)
  }

  openEditAppDialog() {
    this.m_oDialog.open(NewAppDialogComponent, {
      data: {
        editMode: true,
        inputProcessor: this.m_oProcessorInformation
      },
      height: '95vh',
      minWidth: '95vw',
      maxWidth: '95vw'
    })
  }

  getExecuteEvent(oEvent) {
    this.runApplication();
  }

  getJsonText(oEvent) {
    this.m_sJSONParam = this.m_oJsonEditorService.getValue();
  }

  getExecutePurchase(oEvent) {
    this.createAppPaymentObject();
    this.m_oNotificationDisplayService.openConfirmationDialog("You will be re-directed to our payment partner, Stripe. Click 'OK' to continue or 'CANCEL' to end the payment process.<br> Please remember to refresh the page when you return").subscribe(bDialogResult => {
      if (bDialogResult) {
        this.saveAndGetStripePaymentUrl()
      }
    })
  }

  createAppPaymentObject() {
    this.m_oAppPaymentVM = {
      paymentName: `${this.m_oProcessorInformation.processorName}_${new Date().toISOString()}`,
      processorId: this.m_oProcessorInformation.processorId,
      buyDate: new Date().toISOString()
    }
  }

  saveAndGetStripePaymentUrl() {
    this.m_oProcessorService.addAppPayment(this.m_oAppPaymentVM).subscribe(oResponse => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
        this.m_oNotificationDisplayService.openAlertDialog("Error getting recording payment");
      } else {
        this.m_oProcessorService.getStripeOnDemandPaymentUrl(this.m_oAppPaymentVM.processorId, oResponse.message).subscribe({
          next: oResponse => {
            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.message)) {
              this.m_oNotificationDisplayService.openSnackBar("PAYMENT URL RECIEVED", "Close", "right", "bottom");

              let sUrl = oResponse.message;

              window.open(sUrl, '_blank');
            }
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog("ERROR IN FETCHING PAYMENT URL");
          }
        })
      }
    })
  }

  getTagColour(sTagContent) {
    let sTagColor = "red"
    if (sTagContent === 'ERROR') {
      sTagColor = 'red';
    } else if (sTagContent === 'STOPPED') {
      sTagColor = 'yellow';
      sTagContent = "DIALOG_PROCESSES_LOGS_STOP";
    } else if (sTagContent === 'DONE') {
      sTagColor = 'green';
    } else {
      sTagContent = 'green';
    }

    return sTagColor;
  }
}
