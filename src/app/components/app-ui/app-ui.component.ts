import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
  @ViewChild(WapDisplayComponent) wapDisplayComponent: WapDisplayComponent;
  //Processor Information
  processorName: string = this.oConstantsService.getSelectedApplication();
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

  m_aoViewElements: {}[] = [];

  //Array of names for the Tabs
  m_aoTabs: any[] = [];

  //Active Tab Element
  m_sActiveTab: string = ""

  //User's existing workspaces
  m_aoExistingWorkspaces: Workspace[] = [];


  ngOnInit(): void {
    this.fetchWorkspaces();
    if (this.processorName) {
      this.getProcessorDetails(this.processorName);
      this.getProcessorUI(this.processorName);
    }
    else if (this.oActivatedRoute.snapshot.params['processorName']) {
      this.processorName = this.oActivatedRoute.snapshot.params['processorName'];
      this.oConstantsService.setSelectedApplication(this.processorName);
      this.getProcessorDetails(this.processorName);
      this.getProcessorUI(this.processorName);
    }
    else {
      console.log("Problem getting Processor Name")
    }
  }

  constructor(private oActivatedRoute: ActivatedRoute, private oConstantsService: ConstantsService, private oProcessorService: ProcessorService, private oProcessorWorkspaceService: ProcessWorkspaceServiceService, private oRouter: Router, public oViewContainerRef: ViewContainerRef, private oWorkspaceService: WorkspaceService) { }

  /**
   * Retrieve Processor UI from WASDI server
   */
  getProcessorUI(sApplicationName: string) {
    this.oProcessorService.getProcessorUI(sApplicationName).subscribe(oResponse => {
      console.log(oResponse)
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
      console.log(this.m_bRenderAsStrings);
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
   * Run Application => IMPORTANT: PLACEHOLDER
   */
  runApplication() {
    if (this.workspaceForm.sNewWorkspaceName && this.workspaceForm.sExistingWorkspace) {
      console.log("Either select workspace or create new one");
      return
    }
    if (this.workspaceForm.sNewWorkspaceName) {
      this.createWorkspace();
    }
    if (this.workspaceForm.sExistingWorkspace) {
      this.openWorkspace();
    }
  }

  /**
   * Get user's workspaces
   */
  fetchWorkspaces() {
    let oUser: User = this.oConstantsService.getUser();
    if (oUser !== {} as User) {
      this.oWorkspaceService.getWorkspacesInfoListByUser().subscribe(oResponse => {
        this.m_aoExistingWorkspaces = oResponse;
      })
    }
  }

  /**
   * Create a new workspace
   */
  createWorkspace() {
    const { sNewWorkspaceName, sExistingWorkspace } = this.workspaceForm;
    let sWorkspaceName = this.workspaceForm.sNewWorkspaceName;
    this.oWorkspaceService.createWorkspace(sWorkspaceName).subscribe(oResponse => {
      let sWorkspaceId: string | null = oResponse.stringValue;
      if (sWorkspaceId !== null) {
        this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe(oResponse => {
          this.oConstantsService.setActiveWorkspace(oResponse);
          this.oRouter.navigateByUrl(`edit/${oResponse.workspaceId}`)
        })
      }
    })
  }

  /**
   * Open existing workspace
   */
  openWorkspace() {
    const { sNewWorkspaceName, sExistingWorkspace } = this.workspaceForm;
    let sWorkspaceName = this.workspaceForm.sExistingWorkspace;
    let oSelectedWorkspace = this.m_aoExistingWorkspaces.find(oWorkspace => oWorkspace.workspaceName === sWorkspaceName);

    if (oSelectedWorkspace) {
      this.oWorkspaceService.getWorkspaceEditorViewModel(oSelectedWorkspace.workspaceId)?.subscribe(oResponse => {
        this.oConstantsService.setActiveWorkspace(oResponse);
        this.oRouter.navigateByUrl(`edit/${oResponse.workspaceId}`)
      })
    }
  }

  /**
   * 
   */
  // createParams() {
  //   // Output initialization
  //   let oProcessorInput: any = {};

  //   // For each tab
  //   for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
  //     // Get the name of the tab
  //     let sTab = this.m_aoTabs[iTabs];

  //     // For all the view elements of the tab
  //     for (let iControls = 0; iControls < this.m_aoViewElements[sTab].length; iControls++) {
  //       // Take the element
  //       let oElement = this.m_aoViewElements[sTab][iControls];

  //       // Save the value to the output json
  //       if (this.m_bRenderAsStrings && oElement.type != 'numeric') {
  //         oProcessorInput[oElement.paramName] = oElement.getStringValue();
  //       } else {
  //         oProcessorInput[oElement.paramName] = oElement.getValue();
  //       }

  //     }
  //   }
  //   console.log(oProcessorInput)
  //   return oProcessorInput
  // }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  marketplaceReturn() {
    this.changeActiveTab('')
    this.oRouter.navigateByUrl(`${this.processorName}/appDetails`)
  }

  checkParams() {
    this.wapDisplayComponent.checkParams();
  }
}
