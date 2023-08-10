import { Component, OnInit } from '@angular/core';
import { faInfoCircle, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { EditOrganizationDialogComponent } from 'src/app/dialogs/edit-organization-dialog/edit-organization-dialog.component';

@Component({
  selector: 'app-organizations-display',
  templateUrl: './organizations-display.component.html',
  styleUrls: ['./organizations-display.component.css']
})
export class OrganizationsDisplayComponent implements OnInit {
  faPlus = faPlus;
  faInfo = faInfoCircle;
  faX = faX;

  m_aoOrganizations: Array<any> = [];

  constructor(
    private m_oDialog: MatDialog,
    private m_oOrganizationsService: OrganizationsService) { }

  ngOnInit(): void {
    this.getUserOrganizations();
  }

  openNewOrganizationDialog(bIsEditing: boolean, bIsAdmin: boolean, oOrganization?: any) {
    let oDialog = this.m_oDialog.open(EditOrganizationDialogComponent, {
      height: '55vh',
      width: '30vw',
      data: {
        editMode: bIsEditing,
        isAdmin: bIsAdmin,
        organization: oOrganization,
      }
    })

    oDialog.afterClosed().subscribe(() => {
      this.getUserOrganizations(); 
    }); 
  }

  getUserOrganizations() {
    this.m_oOrganizationsService.getOrganizationsListByUser().subscribe({
      next: oResponse => {
        console.log(oResponse);
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoOrganizations = oResponse;
        }
      },
      error: oError => { }
    })
  }

  removeOrganization() {

  }

  openOrganizationDetailsDialog() { }

}
