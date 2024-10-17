import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { NewWorkspaceDialogComponent } from '../../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Workspace } from 'src/app/shared/models/workspace.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-app-ui-menu',
  templateUrl: './app-ui-menu.component.html',
  styleUrls: ['./app-ui-menu.component.css'],
})
export class AppUiMenuComponent implements OnInit {
  @Input() m_oActiveWorkspace: Workspace = null;
  @Input() m_sActiveTab: string = '';
  @Input() m_aoTabs: Array<any> = [];
  @Input() m_aoWorkspaces: Array<any> = [];
  @Input() m_bIsPurchased: boolean = true;
  @Output() m_sSelectedTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oSelectedWorkspace: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecuteAppEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecutePurchaseEmitter: EventEmitter<any> =
    new EventEmitter<any>();

  m_bRunInNewWorkspace: boolean = true;
  m_sNewWorkspaceName: string = '';
  m_bNotification: boolean = false;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oWorkspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    if (this.m_oActiveWorkspace) {
      this.m_bRunInNewWorkspace = false;
    }
  }

  openNewWorkspaceDialog() {
    this.m_oDialog
      .open(NewWorkspaceDialogComponent)
      .afterClosed()
      .subscribe((oResponse) => {
        this.m_oWorkspaceService
          .getWorkspacesInfoListByUser()
          .subscribe((oResponse) => {
            this.m_aoWorkspaces = oResponse;
          });
      });
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }

  getSelectedWorkspace(oEvent: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent) === false) {
      this.m_oActiveWorkspace = oEvent;
      let oEmitObject = {
        isCreating: this.m_bRunInNewWorkspace,
        notification: this.m_bNotification,
        workspace: oEvent,
      };
      this.m_oSelectedWorkspace.emit(oEmitObject);
    }
  }

  executeApp() {
    if (this.m_bRunInNewWorkspace) {
      this.getSelectedWorkspace(this.m_sNewWorkspaceName);
      this.m_oExecuteAppEmitter.emit(true);
    } else {
      this.getSelectedWorkspace(this.m_oActiveWorkspace);
      this.m_oExecuteAppEmitter.emit(false);
    }
  }

  saveAppPurchase() {
    this.m_oExecutePurchaseEmitter.emit(true);
  }

  /**
   * Handle change to new/existing workspace checkbox. If switching back to new, emit Selected Workspace with default options
   */
  newOrExistingWorkspaceChanged(): void {
    this.m_bRunInNewWorkspace = !this.m_bRunInNewWorkspace;
    if (this.m_bRunInNewWorkspace === true) {
      this.m_oSelectedWorkspace.emit({
        isCreating: this.m_bRunInNewWorkspace,
        notification: this.m_bNotification,
        workspace: null,
      });
    }
  }

  openNotificationHelp() {
    this.m_oNotificationDisplayService.openAlertDialog(
      'WASDI will send you an email notification upon completion of this processor',
      'Info',
      'info'
    );
  }
}
