import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  constructor(private oConstantsService: ConstantsService, private oWorkspaceService: WorkspaceService) { }
  workspaces: Workspace[] = []

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
}
