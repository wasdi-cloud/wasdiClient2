import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

//Import Services
import { ConstantsService } from 'src/app/services/constants.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Import Angular Materials Modules:
import { MatDialog } from '@angular/material/dialog';

//Import Models:
import { Workspace } from 'src/app/shared/models/workspace.model';
import { WorkspaceViewModel } from '../workspaces.component';

//Font Awesome Imports:
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-workspace-list-item',
  templateUrl: './workspace-list-item.component.html',
  styleUrls: ['./workspace-list-item.component.css']
})
export class WorkspaceListItemComponent {
  faTrashcan = faTrash;
  @Input() workspace!: any;
  @Output() activeWorkspace = new EventEmitter<Workspace>();
  @Output() deletedWorkspace = new EventEmitter<Workspace>();
  @Output() m_oWorkspaceSelection = new EventEmitter<Workspace>();

  constructor(
    private oConstantsService: ConstantsService,
    public oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private oRouter: Router,
    private oWorkspaceService: WorkspaceService) { }

  getDate(sTimestamp: number) {
    if (sTimestamp) {
      let sDate: Date = new Date(sTimestamp)
      return sDate.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10)
    }
    return "N/A"
  }

  openWorkspace(oWorkspace: Workspace) {
    this.oWorkspaceService.getWorkspaceEditorViewModel(oWorkspace.workspaceId).subscribe(response => {
      if (!response) {
        console.log("Error opening workspace")
        return false;
      }
      this.setActiveWorkspace(response)
      this.oRouter.navigateByUrl(`edit/${response.workspaceId}`);
      return true;
    })
  }

  deleteWorkspace(sWorkspaceId: string) {
    let sMessage = "Are you sure you wish to delete this Workspace?"

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sMessage);

    bConfirmResult.subscribe(dialogResult => {
      if (dialogResult === false) {
        return false;
      }

      let oWorkspaceViewModel: WorkspaceViewModel;
      let oActiveWorkspace: Workspace;

      this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe({
        next: oResponse => {
          oWorkspaceViewModel = oResponse;

          if (oWorkspaceViewModel) {
            let bDeleteFile: boolean = true;
            let bDeleteLayer: boolean = true;
            this.oWorkspaceService.deleteWorkspace(oWorkspaceViewModel, bDeleteFile, bDeleteLayer)?.subscribe({
              next: oResponse => {
                oActiveWorkspace = this.oConstantsService.getActiveWorkspace();
                if (JSON.stringify(oActiveWorkspace) === JSON.stringify(oWorkspaceViewModel)) {
                  oWorkspaceViewModel = {} as WorkspaceViewModel;
                  this.oConstantsService.setActiveWorkspace(oWorkspaceViewModel);
                }
                this.deletedWorkspace.emit(oWorkspaceViewModel)
              },
              error: oError => {
                this.m_oNotificationDisplayService.openAlertDialog("Error deleting this workspace");
              }
            })
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog("Error deleting this workspace");
        }
      });
      return true;
    })
  }

  setActiveWorkspace(oWorkspace: Workspace) {
    this.oConstantsService.setActiveWorkspace(oWorkspace);
  }

  showWorkspaceProperties(oWorkspace: Workspace) {
    this.activeWorkspace.emit(oWorkspace);
  }

  workspaceSelectionChange(oWorkspace: Workspace, oEvent) {
    //Set Checked property of workspace
    oWorkspace['checked'] = oEvent.checked
    //Emit selected (or deselected workspace to parent)
    this.m_oWorkspaceSelection.emit(oWorkspace);
  }
}
