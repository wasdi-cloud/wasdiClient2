import { Component, OnInit } from '@angular/core';

//Service Imports:
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';

//Components Imports:
import { EditOrganizationDialogComponent } from 'src/app/dialogs/edit-organization-dialog/edit-organization-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
//Font Awesome Imports
import { faInfoCircle, faPlus, faUsers, faX } from '@fortawesome/free-solid-svg-icons';

//Angular Materials Imports:
import { MatDialog } from '@angular/material/dialog';

//Fadeout Utilites Import:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Component({
  selector: 'app-organizations-display',
  templateUrl: './organizations-display.component.html',
  styleUrls: ['./organizations-display.component.css']
})
export class OrganizationsDisplayComponent implements OnInit {
  faPlus = faPlus;
  faInfo = faInfoCircle;
  faX = faX;
  faUsers = faUsers;

  m_aoOrganizations: Array<any> = [];

  constructor(
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
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
          this.m_aoOrganizations = oResponse.body;
        }
      },
      error: oError => { }
    })
  }

  removeOrganization(oOrganization: any) {
    let sConfirmMsgOwner = `Are you sure you want to delete ${oOrganization.name}?`
    let sConfirmMsgShared = `Are you sure you want to remove your permissions from ${oOrganization.name}?`;

    let bConfirmResult: any;

    if (oOrganization.adminRole) {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsgOwner);
    } else {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsgShared);
    }
    bConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oOrganizationsService.deleteOrganization(oOrganization.organizationId).subscribe({
          next: oResponse => {
            this.getUserOrganizations();
            this.m_oNotificationDisplayService.openSnackBar("Organization Removed", "Close", 'bottom', 'right');
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog("Error in deleting this organization");
          }
        })
      }
    });
  }

  openOrganizationShareDialog(oOrganization) {
    let dialogData = new ShareDialogModel("organization", oOrganization)
    let dialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      data: dialogData
    });
  }

}
