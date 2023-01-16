import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { WorkspaceViewModel } from '../workspaces.component';

@Component({
  selector: 'app-workspace-list-item',
  templateUrl: './workspace-list-item.component.html',
  styleUrls: ['./workspace-list-item.component.css']
})
export class WorkspaceListItemComponent {
  @Input() workspace!: any;
  @Output() activeWorkspace = new EventEmitter<Workspace>();
  @Output() deletedWorkspace = new EventEmitter<Workspace>();

  constructor(private oConstantsService: ConstantsService, private oRouter: Router, private oWorkspaceService: WorkspaceService) { }

  getDate(sTimestamp: number) {
    if (sTimestamp) {
      let sDate: Date = new Date(sTimestamp)
      return sDate.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10)
    }
    return "N/A"
  }
  openWorkspace(oWorkspace: Workspace) {
    this.setActiveWorkspace(oWorkspace);
    this.oRouter.navigateByUrl(`edit/${oWorkspace.workspaceId}`);
  }

  deleteWorkspace(sWorkspaceId: string) {

    let oWorkspaceViewModel: WorkspaceViewModel;
    let oActiveWorkspace: Workspace;

    this.oWorkspaceService.getWorkspaceEditorViewModel(sWorkspaceId).subscribe(oResponse => {
      oWorkspaceViewModel = oResponse;
      //add confirmation dialog -> booleans will be inside dialog confirmation 
      console.log(oWorkspaceViewModel)
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
  }

  setActiveWorkspace(oWorkspace: Workspace) {
    this.oConstantsService.setActiveWorkspace(oWorkspace);
  }

  showWorkspaceProperties(oWorkspace: Workspace) {
    this.activeWorkspace.emit(oWorkspace);
  }
}
