import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { ImportDialogComponent } from './toolbar-dialogs/import-dialog/import-dialog.component';
import { AppsDialogComponent } from './toolbar-dialogs/apps-dialog/apps-dialog.component';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

import { WorkflowsDialogComponent } from './toolbar-dialogs/workflows-dialog/workflows-dialog.component';
import { Product } from 'src/app/shared/models/product.model';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';


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

  m_iHookIndex: number = 0;

  constructor(
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oRabbitStompService: RabbitStompService
  ) { }

  ngOnInit() {
    //RabbitStomp service call 
    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook("LAUNCHJUPYTERNOTEBOOK",
      this,
      this.rabbitMessageHook, true)
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }


  openAppsDialog(): void {
    this.m_oDialog.open(AppsDialogComponent, {
      height: '90vh',
      width: '90vw',
      minWidth: '90vw'
    })
  }

  openWorkflowsDialog(): void {
    this.m_oDialog.open(WorkflowsDialogComponent, {
      height: '90vh',
      width: '90vw',
      minWidth: '90vw',
      data: {
        products: this.m_aoProducts
      }
    })
  }

  openImportDialog(): void {
    this.m_oDialog.open(ImportDialogComponent, {
      height: '60vh',
      width: '50vw'
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
            sMessage = sMessage + "<BR>" + oResponse.stringValue;
            this.m_oNotificationDisplayService.openAlertDialog(sMessage);
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
