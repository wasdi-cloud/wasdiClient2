import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';


import { MatDialog } from '@angular/material/dialog';
import { AppsDialogComponent } from './toolbar-dialogs/apps-dialog/apps-dialog.component';
import { ImportDialogComponent } from './toolbar-dialogs/import-dialog/import-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { WorkflowsDialogComponent } from './toolbar-dialogs/workflows-dialog/workflows-dialog.component';

import { Product } from 'src/app/shared/models/product.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';



@Component({
  selector: 'app-edit-toolbar',
  templateUrl: './edit-toolbar.component.html',
  styleUrls: ['./edit-toolbar.component.css']
})
export class EditToolbarComponent implements OnInit, OnDestroy {
  @Input() m_aoProducts: Product[];
  @Input() m_bJupyterIsReady: boolean = false;
  @Input() m_b2DMapModeOn: boolean = true;
  m_bFeatureInfoMode: boolean = false;

  @Output() m_b2DMapModeOnChange: EventEmitter<boolean> = new EventEmitter;
  @Output() m_b2DFeatureInfoModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  m_bNotebookIsReady: boolean = false;
  m_sFilterText: string;

  m_sWorkspaceId: string = "";
  m_iHookIndex: number = 0;

  constructor(
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oRabbitStompService: RabbitStompService
  ) { }

  ngOnInit() {
    this.m_sWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    //RabbitStomp service call 
    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook("LAUNCHJUPYTERNOTEBOOK",
      this,
      this.rabbitMessageHook, true)
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }


  openAppsDialog(): void {
    let oAppsDialog = this.m_oDialog.open(AppsDialogComponent, {
      height: '90vh',
      width: '90vw',
      maxWidth: '1500px'
    })

    oAppsDialog.afterClosed().subscribe(() => {
      this.m_oProcessWorkspaceService.loadProcessesFromServer(this.m_sWorkspaceId);
    })
  }

  openWorkflowsDialog(): void {
    this.m_oDialog.open(WorkflowsDialogComponent, {
      height: '90vh',
      width: '90vw',
      maxWidth: '1500px',
      data: {
        products: this.m_aoProducts
      }
    })
  }

  openImportDialog(): void {
    this.m_oDialog.open(ImportDialogComponent, {
      width: '40vw'
    })
  }

  openJupyterNotebookPage(): boolean {
    //Check if user has valid subscription and active project
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === false) {
      return false;
    } else {
      //If user has subscription and project, prepare notebook:
      this.m_oConsoleService.createConsole(this.m_oConstantsService.getActiveWorkspace().workspaceId).subscribe(oResponse => {
        let sMessage = "WASDI is preparing your notebook."
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.boolValue === true) {

          if (oResponse.stringValue.includes("http")) {
            window.open(oResponse.stringValue, '_blank');
          } else {
            sMessage = sMessage + "<br>" + oResponse.stringValue;
            this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'danger');
          }
        }

      });
      return true;
    }
  }

  openShareDialog(): void {
    let oDialogData = new ShareDialogModel("workspace", this.m_oConstantsService.getActiveWorkspace())
    this.m_oDialog.open(ShareDialogComponent, {
      height: '70vh',
      width: '70vw',
      data: oDialogData
    });
  }

  rabbitMessageHook(oRabbitMessage, oController): void {
    if (oRabbitMessage.messageResult === "OK") {
      oController.m_bJupyterIsReady = true;
    }
  }

  switch2D3DMode(): void {
    this.m_b2DMapModeOn = !this.m_b2DMapModeOn;
    this.m_b2DMapModeOnChange.emit(this.m_b2DMapModeOn);
  }

  changeFeatureInfoMode(): void {
    this.m_bFeatureInfoMode = !this.m_bFeatureInfoMode;
    this.m_b2DFeatureInfoModeChange.emit(this.m_bFeatureInfoMode);
  }
}
