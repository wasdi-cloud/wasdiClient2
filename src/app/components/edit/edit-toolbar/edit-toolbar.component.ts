import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

import { faSearch, faRefresh, faInfoCircle, faRocket, faPlusSquare, faGears, faCloudUpload, faPaintBrush, faShareNodes, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceInfoDialogComponent } from '../workspace-info-dialog/workspace-info-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { StylesDialogComponent } from './toolbar-dialogs/styles-dialog/styles-dialog.component';
import { ImportDialogComponent } from './toolbar-dialogs/import-dialog/import-dialog.component';
import { AppsDialogComponent } from './toolbar-dialogs/apps-dialog/apps-dialog.component';
import { NewAppDialogComponent } from './toolbar-dialogs/new-app-dialog/new-app-dialog.component';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

import { WorkflowsDialogComponent } from './toolbar-dialogs/workflows-dialog/workflows-dialog.component';
import { Product } from 'src/app/shared/models/product.model';

@Component({
  selector: 'app-edit-toolbar',
  templateUrl: './edit-toolbar.component.html',
  styleUrls: ['./edit-toolbar.component.css']
})
export class EditToolbarComponent implements OnInit {
  //Font Awesome Icons: 
  faSearch = faSearch;
  faRefresh = faRefresh;
  faInfo = faInfoCircle;
  faRocket = faRocket;
  faPlus = faPlusSquare;
  faGears = faGears;
  faUpload = faCloudUpload;
  faComputer = faLaptopCode;
  faStyles = faPaintBrush;
  faShare = faShareNodes;

  @Input() m_oActiveWorkspace: Workspace;
  @Input() m_aoProducts: Product[];
  @Output() m_sSearchString = new EventEmitter();

  m_bNotebookIsReady: boolean = false;
  m_sFilterText: string;

  m_iHookIndex;

  constructor(
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oRabbitStompService: RabbitStompService
  ) { }

  ngOnInit() {
    //RabbitStomp service call 
    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook("LAUNCHJUPYTERNOTEBOOK",
      this,
      this.rabbitMessageHook, true)
  }

  openWorkspaceInfo(event: MouseEvent) {
    let oDialogRef = this.m_oDialog.open(WorkspaceInfoDialogComponent, {
      width: '60vw',
      data: this.m_oActiveWorkspace
    });
  }


  getFilterText() {
    if (this.m_sFilterText === undefined || this.m_sFilterText === null) {
      this.m_sFilterText = "";
    }
    this.m_sSearchString.emit(this.m_sFilterText);
  }

  resetFilterText(event) {
    event.preventDefault();
    this.m_sFilterText = undefined;
    this.m_sSearchString.emit("");
  }

  /**
   * Secondary Toolbar Options
   */
  openAppsDialog(oEvent: MouseEvent) {
    oEvent.preventDefault();
    let dialogRef = this.m_oDialog.open(AppsDialogComponent, {
      height: '80vh',
      width: '80vw'
    })
  }

  openWorkflowsDialog(event: MouseEvent) {
    event.preventDefault();
    let dialogRef = this.m_oDialog.open(WorkflowsDialogComponent, {
      height: '80vh',
      width: '80vw',
      data: {
        products: this.m_aoProducts
      }
    })
  }

  openNewAppDialog(oEvent: MouseEvent) {
    oEvent.preventDefault();
    let dialogRef = this.m_oDialog.open(NewAppDialogComponent, {
      height: '90vh',
      width: '90vw',
      data: { editMode: false }
    })

  }

  openImportDialog(event: MouseEvent) {
    let oDialog = this.m_oDialog.open(ImportDialogComponent, {
      height: '40vh',
      width: '50vw'
    })
  }

  openJupyterNotebookPage(oEvent: MouseEvent) {
    oEvent.preventDefault
    //Check if user has valid subscription and active project
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === false) {
      return false;
    } else {
      //If user has subscription and project, prepare notebook:
      this.m_oConsoleService.createConsole(this.m_oActiveWorkspace.workspaceId).subscribe(oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.boolValue === true) {
          console.log(oResponse)
          if (oResponse.stringValue.includes("http")) {
            window.open(oResponse.stringValue, '_blank');
          }
        } else {
          let sMessage = "WASDI is preparing your notebook."

          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse.stringValue) === false) {
              sMessage = sMessage + "<BR>" + oResponse.stringValue;
            }
          }
          this.m_bNotebookIsReady = true;
          console.log(sMessage);
        }
      });
      return true;
    }
  }

  openStylesDialog(oEvent: MouseEvent) {
    oEvent.preventDefault();
    let dialogRef = this.m_oDialog.open(StylesDialogComponent, {
      height: '80vh',
      width: '80vw'
    })
  }

  openShareDialog(event: MouseEvent) {
    event.preventDefault();
    let dialogData = new ShareDialogModel("workspace", this.m_oActiveWorkspace)
    let dialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      data: dialogData
    });
  }

  rabbitMessageHook(oRabbitMessage, oController) {

  }
}
