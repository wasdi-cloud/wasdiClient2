import { Component, OnInit } from '@angular/core';

import { ConstantsService } from 'src/app/services/constants.service';
import { OrganizationsService } from 'src/app/services/api/organizations.service';
import { ProjectService } from 'src/app/services/api/project.service';
import { SubscriptionService } from 'src/app/services/api/subscription.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { faBriefcase, faEdit, faEye, faTrashCan, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditSubscriptionDialogComponent } from 'src/app/dialogs/edit-subscription-dialog/edit-subscription-dialog.component';
import { ShareDialogComponent, ShareDialogModel } from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { SubscriptionProjectsDialogComponent } from 'src/app/dialogs/subscription-projects-dialog/subscription-projects-dialog.component';
import { UserSettingsDialogComponent } from '../user-settings-dialog.component';

@Component({
  selector: 'app-subscriptions-display',
  templateUrl: './subscriptions-display.component.html',
  styleUrls: ['./subscriptions-display.component.css']
})
export class SubscriptionsDisplayComponent implements OnInit {
  faUsers = faUsers;
  faBriefcase = faBriefcase;
  faEdit = faEdit;
  faTrashcan = faTrashCan
  faEye = faEye;

  m_bLoadingOrganizations: boolean = true;
  m_bLoadingSubscriptions: boolean = true;
  m_bLoadingProjects: boolean = true;
  m_bIsLoading: boolean = true;

  m_aoSubscriptions: Array<any> = [];
  m_aoSubscriptionsProjects: Array<any> = [];

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<UserSettingsDialogComponent>,
    private m_oOrganizationsService: OrganizationsService,
    private m_oProjectService: ProjectService,
    private m_oSubscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.initializeSubscriptionsInfo();
  }

  initializeSubscriptionsInfo() {
    this.m_oSubscriptionService.getSubscriptionsListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          console.log(oResponse);
          this.m_aoSubscriptions = oResponse;
        }
      },
      error: oError => { }
    })
  }

  openSharedUsersDialog(oSubscription) { 
    let oDialogData = new ShareDialogModel("subscription", oSubscription);
    let oDialogRef = this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw', 
      data: oDialogData
    }); 
  }

  openProjectsDialog(bIsOwner: boolean, oSubscription: any) { 
    let oDialogRef = this.m_oDialog.open(SubscriptionProjectsDialogComponent, {
      height: '70vh', 
      width: '50vw',
      data: {
        subscription: oSubscription
      }
    })
  }

  openEditSubscriptionDialog(bIsOwner: boolean) {
    let oDialogRef = this.m_oDialog.open(EditSubscriptionDialogComponent, {
      height: '80vh', 
      width: '50vw', 
      data: {
        isOwner: bIsOwner
      }
    })
  }

  deleteSubscription() { }

  onDismiss(){ 
    this.m_oDialogRef.close();
  }
}
