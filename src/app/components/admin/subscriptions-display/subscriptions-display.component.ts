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
import { UserSettingsDialogComponent } from '../../header/header-dialogs/user-settings-dialog/user-settings-dialog.component';
import { TranslateService } from '@ngx-translate/core';

import { NotificationDisplayService } from 'src/app/services/notification-display.service';

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
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oOrganizationsService: OrganizationsService,
    private m_oProjectService: ProjectService,
    private m_oSubscriptionService: SubscriptionService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initializeSubscriptionsInfo();
  }

  initializeSubscriptionsInfo() {
    this.m_oSubscriptionService.getSubscriptionsListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
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

  openEditSubscriptionDialog(oSubscription: any, bIsOwner: boolean) {
    let oDialogRef = this.m_oDialog.open(EditSubscriptionDialogComponent, {
      height: '80vh',
      width: '50vw',
      data: {
        subscription: oSubscription,
        editMode: true,
        isOwner: bIsOwner
      }
    })
  }

  deleteSubscription(oSubscription) {
    let sConfirmationMessage: string = `Are you sure you want to remove ${oSubscription.name}?`;


    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

    bConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oSubscriptionService.deleteSubscription(oSubscription.subscriptionId).subscribe({
          next: oResponse => {
            let sMessage = "SUBSCRIPTION DELETED";
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.status === 200) {
              if (oResponse.body.message !== "Done") {
                sMessage += "<br><br>" + this.m_oTranslate.get(oResponse.body.message).subscribe(oTranslation => {
                  return oTranslation
                });
                this.m_oNotificationDisplayService.openAlertDialog(sMessage);
              }
              this.m_oNotificationDisplayService.openSnackBar(sMessage, 'Close', 'right', 'bottom');
            }
          },
          error: oError => {
            let sErrorMessage = "GURU MEDITATION<br>ERROR IN DELETING SUBSCRIPTION";

            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError.data) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.data.message)) {
              sErrorMessage += "<br><br>" + this.m_oTranslate.get(oError.data.message).subscribe(oTranslation => {
                return oTranslation;
              });
            }
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage);
          }
        })
      }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
