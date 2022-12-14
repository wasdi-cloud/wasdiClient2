import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

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

  constructor(private oConstantsService: ConstantsService, private oDialog: MatDialog, private oWorkspaceService: WorkspaceService) { }
  workspaces: Workspace[] = []
  activeWorkspace!: WorkspaceViewModel;
  sharedUsers!: string[]; 

  ngOnInit(): void {
    this.fetchWorkspaceInfoList();
  }
  fetchWorkspaceInfoList() {
    console.log("fetching workspaces")

    let oUser: User = this.oConstantsService.getUser();
    if (oUser !== {} as User) {
      this.oWorkspaceService.getWorkspacesInfoListByUser().subscribe(response => {
        console.log(response)
        this.workspaces = response;
      })
    }
  }


  onShowWorkspace(oWorkspace: Workspace) {
    this.oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      console.log(response);
      this.activeWorkspace = response
      this.sharedUsers = response.sharedUsers
    })
  }
}
