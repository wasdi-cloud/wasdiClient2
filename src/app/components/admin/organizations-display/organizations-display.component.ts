import { Component, OnInit } from '@angular/core';

//Service Imports:
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';

//Components Imports:
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';

//Angular Materials Imports:
import { MatDialog } from '@angular/material/dialog';

//Fadeout Utilites Import:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-organizations-display',
  templateUrl: './organizations-display.component.html',
  styleUrls: ['./organizations-display.component.css']
})
export class OrganizationsDisplayComponent implements OnInit {
  m_aoOrganizations: Array<any> = [];


  m_bIsEditing: boolean = false;
  m_oActiveOrganization: any = null;

  m_oOrganisation: any = {
    address: "",
    description: "",
    email: "",
    name: "",
    organizationId: "",
    sharedUsers: [],
    url: "",
    userId: ""
  }

  m_bNameIsValid = true;
  m_bEmailIsValid = true;

  m_bShowForm: boolean = true;

  constructor(
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getUserOrganizations();
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
    this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      height: '60vh',
      data: dialogData
    });
  }

  setActiveOrganization(oOrganization, bIsEditing) {
    this.m_oActiveOrganization = oOrganization;
    this.m_bIsEditing = bIsEditing;

    this.m_bNameIsValid = true;
    this.m_bEmailIsValid = true;

    // If creating a new organisation, ensure organisation object is clear
    if (this.m_bIsEditing === false) {
      this.m_oOrganisation = {
        address: "",
        description: "",
        email: "",
        name: "",
        organizationId: "",
        sharedUsers: [],
        url: "",
        userId: ""
      };
    }

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveOrganization)) {
      this.initializeOragnizationInfo();
    }
  }

  saveOrganisation() {
    if (!this.checkOrgIsValid()) {
      this.m_oNotificationDisplayService.openAlertDialog('The organisation input is not valid');
    } else {
      this.m_oOrganizationsService.saveOrganization(this.m_oOrganisation).subscribe({
        next: oResponse => {
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
            this.m_oNotificationDisplayService.openAlertDialog("Organization Saved");
          } else {
            this.m_oNotificationDisplayService.openAlertDialog("Error in Saving this Organization");
          }
          this.getUserOrganizations();
        },
        error: oError => {
          let sErrorMsg = "Error in Saving this Organization";
          if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.message)) {
            this.m_oTranslate.instant(oError.message);
          }
        }
      })
    }
  }

  // Check if the organisation input is valid (a name and url are required)
  checkOrgIsValid(): boolean {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oOrganisation)) {
      return false;
    }

    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oOrganisation.email) || FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oOrganisation.name)) {
      if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oOrganisation.email)) {
        this.m_bEmailIsValid = false;
      }
      if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oOrganisation.name)) {
        this.m_bNameIsValid = false;
      }

      return false;
    }
    return true;
  }

  initializeOragnizationInfo() {
    this.m_oOrganizationsService.getOrganizationById(this.m_oActiveOrganization.organizationId).subscribe({
      next: oResponse => {
        this.m_oOrganisation = oResponse;
        console.log(this.m_oOrganisation);
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in getting organization information");
      }
    })
  }

  /**
   * Get the user's input from the app input fields and add to the Organisation model
   */
  getUserInput(oEvent, sInputField) {
    switch (sInputField) {
      case 'name':
        this.m_oOrganisation.name = oEvent.event.target.value;
        break;
      case 'email':
        this.m_oOrganisation.email = oEvent.event.target.value;
        break;
      case 'address':
        this.m_oOrganisation.address = oEvent.event.target.value;
        break;
      case 'url':
        this.m_oOrganisation.url = oEvent.event.target.value;
        break;
      case 'description':
        this.m_oOrganisation.description = oEvent.target.value;
        break;
      default:
        break;
    }
  }
}
