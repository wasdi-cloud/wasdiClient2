import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-new-workspace-dialog',
  templateUrl: './new-workspace-dialog.component.html',
  styleUrls: ['./new-workspace-dialog.component.css']
})
export class NewWorkspaceDialogComponent {
  m_sWorkspaceName: string = "";

  constructor(
    private m_oConstantsService: ConstantsService, 
    private m_oRouter: Router,
    private m_oDialogRef: MatDialogRef<NewWorkspaceDialogComponent>,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  onCreateWorkspace() {
    let oNewWorkspace; 
    if(!this.m_sWorkspaceName) {

    }
    this.m_oWorkspaceService.createWorkspace(this.m_sWorkspaceName).subscribe(oResponse => {
      if(oResponse.boolValue === false){
        console.log("error")
        return false;
      }
      oNewWorkspace = this.m_oWorkspaceService.getWorkspaceEditorViewModel(oResponse.stringValue)
      this.m_oConstantsService.setActiveWorkspace(oNewWorkspace)
      this.m_oRouter.navigateByUrl(`edit/${oResponse.stringValue}`);
      this.m_oDialogRef.close(); 
      return true;
    })
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
