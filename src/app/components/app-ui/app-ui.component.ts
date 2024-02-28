import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
//import API services
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent, ErrorDialogModel } from 'src/app/shared/dialogs/error-dialog/error-dialog.component';

//Import models
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { WapDirective } from 'src/app/directives/wap.directive';
import { WapDisplayComponent } from './wap-display/wap-display.component';
import { NewAppDialogComponent } from '../edit/edit-toolbar/toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

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

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessorWorkspaceService: ProcessWorkspaceService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private oWorkspaceService: WorkspaceService) { }
  //Processor Information
  m_sProcessorName: string = this.m_oConstantsService.getSelectedApplication();
  m_oProcessorInformation: any = {} as Application;

  workspaceForm: any = {
    sNewWorkspaceName: null,
    sExistingWorkspace: null
  }

  //Collapsible elements 
  isCollapsed: boolean = true;

  //Text for the help tab
  m_sHelpHtml: string = "<p>No Help Provided</p>";

  //Processor History
  processorHistory: any = []

  //Processor JSON string
  m_sJSONParam = "{}";

  //Flag to know if all inputs must be rendered as strings or as objects
  m_bRenderAsStrings: boolean = false;

  //Array of View Element Objects
  m_aoViewElements: {}[] = [];

  //Array of names for the Tabs
  m_aoTabs: any[] = [];

  //Active Tab Element
  m_sActiveTab: string = ""

  //User's existing workspaces
  m_aoExistingWorkspaces: Workspace[] = [];

  //Selected Workspace Name: 
  m_oSelectedWorkspace: Workspace | null | undefined = null;

  //Error Message
  m_sMessage = "The following inputs are required:"

  //Active Workspace
  m_oActiveWorkspace = null;

  //User ID
  m_sUserId: string;

  //Does the user want to create a new workspace or open an existing?
  m_bOpenWorkspace: boolean = true;

  ngOnInit(): void {
    this.m_sUserId = this.m_oConstantsService.getUser().userId;
    this.fetchWorkspaces();
    if (this.m_sProcessorName) {
      this.getProcessorDetails(this.m_sProcessorName);
      this.getProcessorUI(this.m_sProcessorName);
    }
    else if (this.m_oActivatedRoute.snapshot.params['processorName']) {
      this.m_sProcessorName = this.m_oActivatedRoute.snapshot.params['processorName'];
      this.m_oConstantsService.setSelectedApplication(this.m_sProcessorName);
      this.getProcessorDetails(this.m_sProcessorName);
      this.getProcessorUI(this.m_sProcessorName);
    }
    else {
      let oDialogData = new ErrorDialogModel("Error!", "Problem retrieving Processor Name");
      let oDialogRef = this.m_oDialog.open(ErrorDialogComponent, {
        maxWidth: '400px',
        data: oDialogData
      })
    }

    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    if (this.m_oActiveWorkspace !== null) {
      console.log("active workspace")
      this.workspaceForm.sExistingWorkspace = this.m_oActiveWorkspace.workspaceName;
      console.log(this.m_oActiveWorkspace)
    }
  }

  /**
   * Retrieve Processor UI from WASDI server
   */
  getProcessorUI(sApplicationName: string) {
    this.m_oProcessorService.getProcessorUI(sApplicationName).subscribe(oResponse => {
      for (let iTabs = 0; iTabs < oResponse.tabs.length; iTabs++) {
        let oTab = oResponse.tabs[iTabs];

        this.m_aoTabs.push(oTab);

        if (iTabs === 0) {
          this.m_sActiveTab = oTab.name;
        }
      }
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
    console.log(this.m_sActiveTab)
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
      this.processorHistory = response
    })
  }

  /**
   * Get JSON parameters from the UI 
   */
  showParamsJSON() {
    let oProcessorInput = this.createParams();
    console.log(oProcessorInput)
    this.m_sJSONParam = JSON.stringify(oProcessorInput, undefined, 4)
    console.log(this.m_sJSONParam);
  }

  /**
   * Get Processor details from server
   */
  getProcessorDetails(processorName: string) {
    return this.m_oProcessorService.getMarketplaceDetail(processorName).subscribe(response => {
      this.m_oProcessorInformation = response;
    })
  }

  /**
   * Run Application in either Selected Workspace or New Workspace
   */
  runApplication() {
    console.log("run application")

    let bCheck: boolean = this.checkParams();

    if (!bCheck) {
      this.m_oNotificationDisplayService.openAlertDialog("Error Running Application.")
      return;
    }

    if (this.workspaceForm.sNewWorkspaceName && this.workspaceForm.sExistingWorkspace) {
      console.log("Either select workspace or create new one");
      return
    }

    //If there is an active workspace: 
    if (this.m_oActiveWorkspace.workspaceId && this.m_bOpenWorkspace === true) {
      this.m_oSelectedWorkspace = this.m_oActiveWorkspace;
    }
    // let asMessages = [];
    let oProcessorInput = this.createParams();
    let oController = this;

    let sApplicationName: string = this.m_oConstantsService.getSelectedApplication();


    // If we are opening an existing workspace:
    if (this.m_bOpenWorkspace === true && FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedWorkspace) === false) {
      this.oWorkspaceService.getWorkspaceEditorViewModel(this.m_oSelectedWorkspace.workspaceId).subscribe(oResponse => {
        if (oResponse) {
          this.executeProcessorInWorkspace(this, sApplicationName, oProcessorInput, oResponse);
        }
      });
      //If we are creating a new workspace:
    } else if (this.m_bOpenWorkspace === true && FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedWorkspace) === true) {
      this.m_oNotificationDisplayService.openAlertDialog("Please make a valid workspace selection");
    } else {
      let sWorkspaceName: string;
      let sUserProvidedWorkspaceName: string = this.workspaceForm.sNewWorkspaceName;
      if (sUserProvidedWorkspaceName) {
        sWorkspaceName = this.workspaceForm.sNewWorkspaceName;
      } else {
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

  getSelectedWorkspaceId(oEvent) {
    if(FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent)) {
      return false;
    } else {
      this.m_oActiveWorkspace = oEvent; 
      this.m_oSelectedWorkspace = oEvent;
      return true;
    }
  }

  checkParams() {
    let bIsValid: boolean = true;

    let asMessages: string[] = [];
    this.m_sMessage = "The following inputs are required: "
    for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
      if (!this.wapDisplayComponent.get(iTabs)?.checkParams(asMessages)) {
        bIsValid = false;
        this.m_sMessage = this.m_sMessage + asMessages + "\n";
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
    this.workspaceForm.sExistingWorkspace = oEvent.value;
    console.log(this.workspaceForm.sExistingWorkspace);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
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
      width: '70vw',
      height: '70vh'
    })
  }

  setOpenNewWorkspace(oInput: any): void {
    let parsedInput = JSON.parse(oInput.value.toLowerCase());
    this.m_bOpenWorkspace = parsedInput;
  }

  getExecuteEvent(oEvent) {
    this.runApplication();
  }

}
