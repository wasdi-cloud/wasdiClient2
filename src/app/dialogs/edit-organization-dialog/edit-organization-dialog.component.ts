import { Component, Inject, OnInit, } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { TranslateService } from '@ngx-translate/core';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-edit-organization-dialog',
  templateUrl: './edit-organization-dialog.component.html',
  styleUrls: ['./edit-organization-dialog.component.css']
})
export class EditOrganizationDialogComponent implements OnInit {
  m_oInputOrganization: any;

  m_oOrganization: any = {
    address: "",
    description: "",
    email: "",
    name: "",
    organizationId: "",
    sharedUsers: [],
    url: "",
    userId: ""
  }

  m_bIsEditing: boolean = false;
  m_bIsAdmin: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oAlertDialog: AlertDialogTopService,
    private m_oDialogRef: MatDialogRef<EditOrganizationDialogComponent>,
    private m_oOrganizationsService: OrganizationsService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_oInputOrganization = this.m_oData.organization;
    this.m_bIsEditing = this.m_oData.editMode;

    //If Editing Org - set Admin role and get org info
    if (this.m_bIsEditing) {
      this.m_bIsAdmin = this.m_oData.organization.adminRole;
      this.initializeOragnizationInfo();
    }
  }

  initializeOragnizationInfo() {
    this.m_oOrganizationsService.getOrganizationById(this.m_oInputOrganization.organizationId).subscribe({
      next: oResponse => {
        this.m_oOrganization = oResponse;
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "Error in getting organization information");
      }
    })
  }

  saveOrganization() {
    this.m_oOrganizationsService.saveOrganization(this.m_oOrganization).subscribe({
      next: oResponse => {
        console.log(oResponse);
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          this.m_oAlertDialog.openDialog(4000, "Organization Saved");
        } else {
          this.m_oAlertDialog.openDialog(4000, "Error in Saving this Organization");
        }
      },
      error: oError => {
        let sErrorMsg = "Error in Saving this Organization";
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.message)) {
          this.m_oTranslate.instant(oError.message);
        }
      }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
