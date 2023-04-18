import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { NewWorkspaceDialogComponent } from './new-workspace-dialog/new-workspace-dialog.component';
import { GlobeService } from 'src/app/services/globe.service';
export interface WorkspaceViewModel {
  activeNode: boolean;
  apiUrl: string;
  cloudProvider: string;
  creationDate: number;
  lastEditDate: number;
  name: string;
  nodeCode: string;
  processesCount: string;
  sharedUsers: string[];
  slaLink: string;
  userId: string;
  workspaceId: string;
}

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {
  //Icons: 
  faPlus = faPlus

  constructor(private m_oGlobeService: GlobeService, private oConstantsService: ConstantsService, private m_oDialog: MatDialog, private oWorkspaceService: WorkspaceService) { }
  workspaces: Workspace[] = []
  activeWorkspace!: WorkspaceViewModel;
  sharedUsers!: string[];

  ngOnInit(): void {
    this.fetchWorkspaceInfoList();
    this.m_oGlobeService.initRotateGlobe('CesiumContainer3'); 

  }
  fetchWorkspaceInfoList() {
    console.log("fetching workspaces")

    let oUser: User = this.oConstantsService.getUser();
    if (oUser !== {} as User) {
      this.oWorkspaceService.getWorkspacesInfoListByUser().subscribe(response => {
        this.workspaces = response;
      })
    }
  }

  onDeleteWorkspace(oWorkspace: Workspace) {
    this.fetchWorkspaceInfoList();
  }

  onShowWorkspace(oWorkspace: Workspace) {
    this.oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      this.activeWorkspace = response
      this.sharedUsers = response.sharedUsers
    })
  }

  openNewWorkspaceDialog() {
    let oDialogRef = this.m_oDialog.open(NewWorkspaceDialogComponent, {
      width: '30vw'
    })
  }
}
