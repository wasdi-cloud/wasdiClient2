import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { NewWorkspaceDialogComponent } from '../../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Workspace } from 'src/app/shared/models/workspace.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-app-ui-menu',
  templateUrl: './app-ui-menu.component.html',
  styleUrls: ['./app-ui-menu.component.css']
})
export class AppUiMenuComponent {
  @Input() m_oActiveWorkspace: Workspace = null;
  @Input() m_sActiveTab: string = "";
  @Input() m_aoTabs: Array<any> = [];
  @Input() m_aoWorkspaces: Array<any> = [];
  @Input() m_bIsPurchased: boolean = true;
  @Output() m_sSelectedTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oSelectedWorkspace: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecuteAppEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecutePurchaseEmitter: EventEmitter<any> = new EventEmitter<any>();

  m_bRunInNewWorkspace: boolean = true;
  m_sNewWorkspaceName: string = "";


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  openNewWorkspaceDialog() {
    this.m_oDialog.open(NewWorkspaceDialogComponent).afterClosed().subscribe(oResponse => {
      this.m_oWorkspaceService.getWorkspacesInfoListByUser().subscribe(oResponse => {
        this.m_aoWorkspaces = oResponse
      })
    })
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }

  getSelectedWorkspace(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oActiveWorkspace = oEvent;
      this.m_oSelectedWorkspace.emit(oEvent)
    }
  }

  executeApp() {
    this.m_oExecuteAppEmitter.emit(true);
  }

  saveAppPurchase() {
    this.m_oExecutePurchaseEmitter.emit(true);
  }

  newOrExistingWorkspaceChanged() {
    this.m_bRunInNewWorkspace = !this.m_bRunInNewWorkspace;

  }
}
