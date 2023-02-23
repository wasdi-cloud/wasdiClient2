import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { WorkspaceViewModel } from '../workspaces.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace-list-item',
  templateUrl: './workspace-list-item.component.html',
  styleUrls: ['./workspace-list-item.component.css']
})
export class WorkspaceListItemComponent {
  @Input() workspace!: any;
  @Output() activeWorkspace = new EventEmitter<Workspace>();
  @Output() deletedWorkspace = new EventEmitter<Workspace>();

  constructor(private oConstantsService: ConstantsService, public oDialog: MatDialog, private oRouter: Router, private oWorkspaceService: WorkspaceService) { }

  getDate(sTimestamp: number) {
    if (sTimestamp) {
      let sDate: Date = new Date(sTimestamp)
      return sDate.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10)
    }
    return "N/A"
  }
  openWorkspace(oWorkspace: Workspace) {
    this.oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      if(!response) {
        console.log("Error opening workspace")
        return false;
      } 
      console.log(response)
      this.setActiveWorkspace(response)
      this.oRouter.navigateByUrl(`edit/${response.workspaceId}`);
      return true; 
    })
    
  }

  deleteWorkspace(sWorkspaceId: string) {
    let sMessage = "Are you sure you wish to delete this Workspace?"

    let dialogData = new ConfirmationDialogModel("Confirm Deletion", sMessage);

    let dialogRef = this.oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    })

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === false) {
        return false;
      }

      let oWorkspaceViewModel: WorkspaceViewModel;
      let oActiveWorkspace: Workspace;

      this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe(oResponse => {
        oWorkspaceViewModel = oResponse;

        if (oWorkspaceViewModel) {
          let bDeleteFile: boolean = true;
          let bDeleteLayer: boolean = true;
          this.oWorkspaceService.deleteWorkspace(oWorkspaceViewModel, bDeleteFile, bDeleteLayer)?.subscribe(oResponse => {
            oActiveWorkspace = this.oConstantsService.getActiveWorkspace();
            if (JSON.stringify(oActiveWorkspace) === JSON.stringify(oWorkspaceViewModel)) {
              oWorkspaceViewModel = {} as WorkspaceViewModel;
              this.oConstantsService.setActiveWorkspace(oWorkspaceViewModel);
            }
            this.deletedWorkspace.emit(oWorkspaceViewModel)
          })
        }
      })
      return true;
    })
  }

  setActiveWorkspace(oWorkspace: Workspace) {
    this.oConstantsService.setActiveWorkspace(oWorkspace);
  }

  showWorkspaceProperties(oWorkspace: Workspace) {
    this.activeWorkspace.emit(oWorkspace);
  }
}
