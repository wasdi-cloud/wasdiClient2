import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { MissionsService } from 'src/app/services/api/missions.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import {
  ShareDialogComponent,
  ShareDialogModel,
} from 'src/app/shared/dialogs/share-dialog/share-dialog.component';

@Component({
  selector: 'app-private-missions',
  templateUrl: './private-missions.component.html',
  styleUrls: ['./private-missions.component.css'],
})
export class PrivateMissionsComponent implements OnInit {
  m_bMissionsLoaded: boolean = false;

  m_aoMissions: Array<any> = [];

  constructor(
    private m_oDialog: MatDialog,
    private m_oMissionsService: MissionsService,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) {}

  ngOnInit(): void {
    this.getUserMissions();
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
    window.location.href =
      'mailto:info@wasdi.cloud?subject=New%20Private%20Mission';
  }
}
