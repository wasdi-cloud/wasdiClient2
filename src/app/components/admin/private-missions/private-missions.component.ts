import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AdminDashboardService } from 'src/app/services/api/admin-dashboard.service';
import { MissionsService } from 'src/app/services/api/missions.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import {
  ShareDialogComponent,
  ShareDialogModel,
} from 'src/app/shared/dialogs/share-dialog/share-dialog.component';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-private-missions',
  templateUrl: './private-missions.component.html',
  styleUrls: ['./private-missions.component.css'],
})
export class PrivateMissionsComponent implements OnInit {
  m_bMissionsLoaded: boolean = false;

  m_aoMissions: Array<any> = [];

  m_oUser: User = {} as User;

  constructor(
    private m_oAdminDashboardService: AdminDashboardService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oMissionsService: MissionsService,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) {}

  ngOnInit(): void {
    this.getUserMissions();
    this.m_oUser = this.m_oConstantsService.getUser();
  }

  getUserMissions() {
    this.m_oMissionsService.getUserPrivateMissions().subscribe({
      next: (oResponse) => {
        this.m_bMissionsLoaded = true;
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoMissions = oResponse;
        }
      },
      error: (oError) => {
        this.m_bMissionsLoaded = true;
        this.m_oNotificationDisplayService.openAlertDialog(
          "Could not get user's missions",
          'Error',
          'danger'
        );
      },
    });
  }

  openShareUI(oMission: any) {
    let dialogData = new ShareDialogModel('mission', oMission);
    this.m_oDialog.open(ShareDialogComponent, {
      width: '50vw',
      height: '60vh',
      data: dialogData,
    });
  }

  openContactForm() {
    window.location.href = 'mailto:info@wasdi.cloud?subject=Private%20Missions';
  }

  removeMission(oMission) {
    let sMessage = '';
    if (this.m_oUser.userId !== oMission.missionOwner) {
      sMessage =
        'To remove private missions, you must contact a member of WASDI Staff. Do you will wish to proceed?';
      this.m_oNotificationDisplayService
        .openConfirmationDialog(sMessage, 'Confirm Action', 'alert')
        .subscribe((bResult) => {
          if (bResult) {
            this.openContactForm();
          }
        });
    } else {
      sMessage =
        'Are you sure you wish to remove your rights on this mission? <br>To be re-added to the mission you will have to contact the mission owner.';
      this.m_oNotificationDisplayService
        .openConfirmationDialog(sMessage, 'Confirm Action', 'alert')
        .subscribe((bResult) => {
          if (bResult) {
            this.m_oAdminDashboardService
              .removeResourcePermission(
                'mission',
                oMission.missionIndexValue,
                this.m_oUser.userId
              )
              .subscribe({
                next: (oResponse) => {
                  this.m_oNotificationDisplayService.openSnackBar(
                    'Mission Permissions Removed',
                    'Success',
                    'success-snackbar'
                  );
                  this.getUserMissions();
                },
                error: (oError) => {
                  this.m_oNotificationDisplayService.openAlertDialog(
                    'Could not remove user',
                    'danger'
                  );
                },
              });
          }
        });
    }
  }
}
