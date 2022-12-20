import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  constructor(private oConstantsService: ConstantsService, private oDialog: MatDialog, private oWorkspaceService: WorkspaceService) { }
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

  // Dialog Box Logic:
  openDialog() {
    const dialogRef = this.oDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Are you sure you want to delete this?",
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        console.log("Deleted"); 
      }
      else {
        console.log("Not deleted");
      }
    })
  }

}
