import { Component, OnInit } from '@angular/core';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Router } from '@angular/router';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessWorkspaceServiceService } from 'src/app/services/api/process-workspace.service';

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
  //Processor Information
  processorName: string = this.oConstantsService.getSelectedApplication();
  processorInformation: any = {} as application;

  m_aoViewElements: any = [];

  //Flag to know if all the inputs must be rendered as strings or objects
  m_bRenderAsStrings: boolean = false;

  //Active Tab Element
  activeTab: string = ""

  //Collapsible elements 
  isCollapsed: boolean = true;

  //Text for the help tab
  m_sHelpHtml: string = "<p>No Help Provided</p>";

  //Processor History
  processorHistory: any = []

  //Processor JSON string
  m_sJSONParam = "{}";

  //Array of names for the Tabs
  m_aoTabs: any[] = [];


  ngOnInit(): void {
    if (this.processorName) {
      this.getProcessorDetails(this.processorName);
      this.getProcessorUI(this.processorName);

    } else {
      console.log("Problem getting Processor Name")
    }
  }

  constructor(private oConstantsService: ConstantsService, private oProcessorService: ProcessorService, private oProcessorWorkspaceService: ProcessWorkspaceServiceService, private oRouter: Router) { }

  /**
   * Get Processor UI from Server
   */
  getProcessorUI(processorName: string) {
    this.oProcessorService.getProcessorUI(processorName).subscribe(response => {
      console.log(response)
    })
  }

  generateViewElements(oFormToGenerate: any) {
    // Output initialization
    let aoViewElements: any = [];
    // Create the factory
    //let oFactory = new ViewElementFactory();

    // For each tab
    for (let iTabs = 0; iTabs < oFormToGenerate.tabs.length; iTabs++) {
      // Get the tab
      let oTab = oFormToGenerate.tabs[iTabs];
      // Let the factory create the array of controls to add
      //let aoTabControls = oFactory.getTabElements(oTab);
      // Save the tab controls in the relative property
      // aoViewElements[oTab.name] = aoTabControls;
    }

    return aoViewElements;
  }

  /**
   * Change Active Tab
   */
  changeActiveTab(sTab: string) {
    if (this.activeTab !== sTab) {
      this.activeTab = sTab;
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
      console.log(this.processorHistory)
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
   * Get processor details
   */

  getProcessorDetails(processorName: string) {
    return this.oProcessorService.getMarketplaceDetail(processorName).subscribe(response => {
      this.processorInformation = response;
    })
  }

  /**
   * 
   */
  createParams() {
    // Output initialization
    let oProcessorInput: any = {};

    // For each tab
    for (let iTabs = 0; iTabs < this.m_aoTabs.length; iTabs++) {
      // Get the name of the tab
      let sTab = this.m_aoTabs[iTabs];

      // For all the view elements of the tab
      for (let iControls = 0; iControls < this.m_aoViewElements[sTab].length; iControls++) {
        // Take the element
        let oElement = this.m_aoViewElements[sTab][iControls];

        // Save the value to the output json
        if (this.m_bRenderAsStrings && oElement.type != 'numeric') {
          oProcessorInput[oElement.paramName] = oElement.getStringValue();
        } else {
          oProcessorInput[oElement.paramName] = oElement.getValue();
        }

      }
    }
    console.log(oProcessorInput)
    return oProcessorInput
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  marketplaceReturn() {
    this.changeActiveTab('help')
    this.oRouter.navigateByUrl('marketplace')
  }
}
