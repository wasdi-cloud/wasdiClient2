import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

import { faSearch, faRefresh, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceInfoDialogComponent } from '../workspace-info-dialog/workspace-info-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { StylesDialogComponent } from './toolbar-dialogs/styles-dialog/styles-dialog.component';
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

  @Input() m_oActiveWorkspace: Workspace;
  @Output() m_sSearchString = new EventEmitter();

  m_sFilterText: string;

  constructor(
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog
  ) { }

  ngOnInit() { }

  openWorkspaceInfo(event: MouseEvent) {
    let oDialogRef = this.m_oDialog.open(WorkspaceInfoDialogComponent, {
      width: '60vw',
      data: this.m_oActiveWorkspace
    });
  }


  getFilterText() {
    if (this.m_sFilterText === undefined || this.m_sFilterText === null) {
      this.m_sFilterText = "";
      console.log(this.m_sFilterText)
    }
    console.log(this.m_sFilterText)
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

  openAppsDialog(event: MouseEvent) {
    event.preventDefault();
  }

  openNewAppDialog(event: MouseEvent) {
    event.preventDefault();
  }

  openWorkflowsDialog(event: MouseEvent) {
    event.preventDefault();
  }

  openJupyterNotebookPage(event: MouseEvent) {
    event.preventDefault
    this.m_oConsoleService.createConsole(this.m_oActiveWorkspace.workspaceId).subscribe(oResponse => {
      window.open(oResponse.stringValue, "_blank")
    })
  }

  openStylesDialog(event: MouseEvent) {
    event.preventDefault();
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
}
