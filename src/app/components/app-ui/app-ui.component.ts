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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
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

  //Active Tab Element
  activeTab: string = ""

  //Collapsible elements 
  isCollapsed: boolean = true;

  //Text for the help tab
  m_sHelpHtml!: SafeHtml;

  //Processor History
  processorHistory: any = []



  ngOnInit(): void {
    if (this.processorName) {
      this.getProcessorDetails(this.processorName);
    } else {
      console.log("Problem getting Processor Name")
    }
  }

  constructor(private oConstantsService: ConstantsService, private oProcessorService: ProcessorService, private oProcessorWorkspaceService: ProcessWorkspaceServiceService, private oRouter: Router, private sanitizer: DomSanitizer) { }

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
      this.m_sHelpHtml = this.sanitizer.bypassSecurityTrustHtml(response.stringValue);
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
   * 
   * @param processorName 
   * @returns 
   */

  getProcessorDetails(processorName: string) {
    return this.oProcessorService.getMarketplaceDetail(processorName).subscribe(response => {
      this.processorInformation = response;
    })
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  marketplaceReturn() {
    this.changeActiveTab('help')
    this.oRouter.navigateByUrl('marketplace')
  }
}
