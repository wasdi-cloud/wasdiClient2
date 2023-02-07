import { Component, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
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
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Import models
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { WapDirective } from 'src/app/directives/wap.directive';
import { WapDisplayComponent } from './wap-display/wap-display.component';

export interface application {
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
  ]
})
export class AppUiComponent implements OnInit {
  @ViewChild(WapDirective, { static: true }) appWap!: WapDirective;
  @ViewChildren(WapDisplayComponent) wapDisplayComponent: QueryList<WapDisplayComponent>;
  //Processor Information
  processorName: string = this.m_oConstantsService.getSelectedApplication();
  processorInformation: any = {} as application;

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


  ngOnInit(): void {
    this.fetchWorkspaces();
    if (this.processorName) {
      this.getProcessorDetails(this.processorName);
      this.getProcessorUI(this.processorName);
    }
    else if (this.oActivatedRoute.snapshot.params['processorName']) {
      this.processorName = this.oActivatedRoute.snapshot.params['processorName'];
      this.m_oConstantsService.setSelectedApplication(this.processorName);
      this.getProcessorDetails(this.processorName);
      this.getProcessorUI(this.processorName);
    }
    else {
      console.log("Problem getting Processor Name")
    }
  }

  constructor(private oActivatedRoute: ActivatedRoute, private m_oConstantsService: ConstantsService, private oProcessorService: ProcessorService, private oProcessorWorkspaceService: ProcessWorkspaceServiceService, private oRouter: Router, public oViewContainerRef: ViewContainerRef, private oWorkspaceService: WorkspaceService) { }

  /**
   * Retrieve Processor UI from WASDI server
   */
  getProcessorUI(sApplicationName: string) {
    this.oProcessorService.getProcessorUI(sApplicationName).subscribe(oResponse => {
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
  changeActiveTab(sTab) {
    if (this.m_sActiveTab !== sTab) {
      this.m_sActiveTab = sTab;
    }

    if (sTab === 'help') {
      this.getHelpFromProcessor(this.processorName);
    }

    if (sTab === 'history') {
      this.showHistory();
    }

  }

  /**
   * Retrieve the Help HTML
   */
  getHelpFromProcessor(sProcessorName: string) {
    this.oProcessorService.getHelpFromProcessor(sProcessorName).subscribe(response => {
      this.m_sHelpHtml = response.stringValue;
    })
  }

  /**
   * Load the history of this user with this application
   */
  showHistory() {
    this.oProcessorWorkspaceService.getProcessesByProcessor(this.processorName).subscribe(response => {
      this.processorHistory = response
    })
  }

  /**
   * Get JSON parameters from the UI 
   */
  // showParamsJSON() {
  //   let oProcessorInput = this.getProcessorUI();
  //   console.log(oProcessorInput);
  //   this.m_sJSONParam = JSON.stringify(oProcessorInput)
  //   console.log(this.m_sJSONParam); 
  // }

  /**
   * Get Processor details from server
   */
  getProcessorDetails(processorName: string) {
    return this.oProcessorService.getMarketplaceDetail(processorName).subscribe(response => {
      this.processorInformation = response;
    })
  }

  /**
   * Run Application in either Selected Workspace or New Workspace
   */
  runApplication() {
    console.log("run application")

    let bCheck: boolean = this.checkParams();

    if (!bCheck) {
      console.log("Missing Inputs");
      return;
    }

    if (this.workspaceForm.sNewWorkspaceName && this.workspaceForm.sExistingWorkspace) {
      console.log("Either select workspace or create new one");
      return
    }
    // let asMessages = [];
    let oProcessorInput = this.createParams();
    let oController = this;

    let sApplicationName: string = this.m_oConstantsService.getSelectedApplication();

    if (this.m_oSelectedWorkspace === null) {
      const { sNewWorkspaceName, sExistingWorkspace } = this.workspaceForm;
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
      // let sOpenError = this.m_oTranslate.instant("MSG_MKT_WS_OPEN_ERROR");
      // let sCreateError = this.m_oTranslate.instant("MSG_MKT_WS_CREATE_ERROR");

      //Create a new Workspace
      this.oWorkspaceService.createWorkspace(sWorkspaceName).subscribe(oResponse => {
        let sWorkspaceId = oResponse.stringValue;

        if (sWorkspaceId === null) {
          console.log("error");
          return;
        }
        this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe(oResponse => {
          if (oResponse === null || oResponse === undefined) {
            console.log("error");
          }
          this.executeProcessorInWorkspace(oController, sApplicationName, oProcessorInput, oResponse);
        })
      })
    } else {
      this.executeProcessorInWorkspace(this, sApplicationName, oProcessorInput, this.m_oSelectedWorkspace);
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
    oController.m_oConstantsService.setActiveWorkspace(oWorkspace);
    oController.oProcessorService.runProcessor(sApplicationName, JSON.stringify(oProcessorInput)).subscribe(oResponse => {
      if (oResponse) {
        this.oRouter.navigateByUrl(`edit/${oWorkspace.workspaceId}`)
      }
    })
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


  getSelectedWorkspaceId(event) {
    this.m_oSelectedWorkspace = this.m_aoExistingWorkspaces.find(oWorkspace => oWorkspace.workspaceName === event.target.value);

    if (this.m_oSelectedWorkspace?.workspaceId === undefined) {
      return false
    }
    return this.m_oSelectedWorkspace.workspaceId;
  }

  checkParams() {
    let bIsValid: boolean = true;

    for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
      if (!this.wapDisplayComponent.get(iTabs)?.checkParams()) {
        bIsValid = false;
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

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  marketplaceReturn() {
    this.changeActiveTab('')
    this.oRouter.navigateByUrl(`${this.processorName}/appDetails`)
  }

}
