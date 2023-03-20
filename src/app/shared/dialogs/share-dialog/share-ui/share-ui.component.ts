import { Component, Input, OnInit } from '@angular/core';
import { faUserPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
@Component({
  selector: 'app-share-ui',
  templateUrl: './share-ui.component.html',
  styleUrls: ['./share-ui.component.css']
})
export class ShareUiComponent implements OnInit {
  //Font awesome icons: 
  faUserPlus = faUserPlus
  faTrashCan = faTrash

  m_aoSharedUsers: any;
  m_sUserIdSearch: string;

  @Input() resource: any;
  @Input() resourceType: string;

  constructor(private m_oWorkspaceService: WorkspaceService) {

  }

  ngOnInit() {
    console.log(this.resource)
    console.log(this.resourceType)
    this.getEnabledUsers()
  }

  getEnabledUsers() {
    if (this.resourceType && this.resource) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.getUsersBySharedWorkspace(this.resource.workspaceId).subscribe(oResponse => {
          if (oResponse) {
            this.m_aoSharedUsers = oResponse;
          }
        })
      }

      if (this.resourceType === 'style') { }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }

  onAddEnabledUser() {
    if (this.resourceType && this.resource && this.m_sUserIdSearch.length !== 0) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.putShareWorkspace(this.resource.workspaceId, this.m_sUserIdSearch).subscribe(oResponse => {
          console.log(oResponse)
          if (oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'style') { }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }

  onRemoveEnabledUser(sUserId: string) {
    if (this.resourceType && this.resource) {
      if (this.resourceType === 'workspace') {
        this.m_oWorkspaceService.deleteUserSharedWorkspace(this.resource.workspaceId, sUserId).subscribe(oResponse => {
          if (oResponse.intValue === 200 && oResponse.stringValue === "Done") {
            this.getEnabledUsers();
          }
        })
      }

      if (this.resourceType === 'style') { }

      if (this.resourceType === 'workflow') { }

      if (this.resourceType === 'processor') { }
    }
  }
}
