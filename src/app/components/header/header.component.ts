import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';

import { ConstantsService } from 'src/app/services/constants.service';
import { KeycloakService } from 'keycloak-angular';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProjectService } from 'src/app/services/api/project.service';
import { TranslateService } from '@ngx-translate/core';

import { User } from 'src/app/shared/models/user.model';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AuthService } from 'src/app/auth/service/auth.service';
import { NotificationsQueueService } from 'src/app/services/notifications-queue.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  m_oUser: User;
  m_sActiveProjectName: string = "";
  m_aoUserProjects: Array<any> = [];
  m_aoUserProjectsMap: Array<any> = [];
  m_oProject: any;
  m_oSelectedProject: any = { name: "No Active Project", projectId: null };
  m_aoNotifications: any = [];
  m_bHasNotifications: boolean = false;
  constructor(
    private m_oAuthService: AuthService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oNotificationsQueueService: NotificationsQueueService,
    private m_oProjectService: ProjectService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_oUser = this.m_oConstantsService.getUser();
    this.initializeProjectsInfo();
    this.m_oNotificationsQueueService.m_aoNotificationSubscription$.subscribe({
      next: oResponse => {
        this.m_aoNotifications = oResponse
        if (this.m_aoNotifications.length !== 0) {
          this.m_bHasNotifications = true;
        }
      }
    })
  }


  initializeProjectsInfo() {
    let oFirstProjectElement = { name: "No Active Project", projectId: null };

    this.m_oProjectService.getValidProjectsListByUser().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoUserProjects = oResponse;

          let aoProjects = [oFirstProjectElement].concat(oResponse);

          this.m_aoUserProjectsMap = aoProjects.map(oProject => {
            return ({ name: oProject.name, projectId: oProject.projectId });
          });
          let asSubscriptionNames: Array<string> = [];

          this.m_oProject = oFirstProjectElement;

          this.m_aoUserProjects.forEach((oValue) => {
            //Add subscription name to the array
            asSubscriptionNames.push(oValue.subscriptionName);
            //FRONTEND FIX FOR NO ACTIVE PROJECT SELECT: 
            if (oValue.projectId === this.m_oSelectedProject.projectId) {
              this.m_oSelectedProject = oFirstProjectElement;
            }
            if (oValue.activeProject) {
              this.m_oSelectedProject = oValue;
              this.m_oConstantsService.setActiveProject(oValue);
            };
          });

          this.m_oConstantsService.setActiveSubscriptions(asSubscriptionNames);
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedProject)) {
            this.m_oSelectedProject = this.m_aoUserProjectsMap[0];
          }
          // this.m_bLoadingProjects = false;
        } else {
          // this.m_oAlertDialog.openDialog(4000, "Error in getting your projects");
          // this.m_bLoadingProjects = false;
          this.m_oProject = oFirstProjectElement;

        }
      },
      error: oError => {
        let sErrorMessage = "Error in getting your projects";
        this.m_oProject = oFirstProjectElement;
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage);
      }
    });
  }

  setActiveProject(oProject: any) {
    let sSetProject: string = this.m_oTranslate.instant("ROOT_ACTIVE_PROJECT_CHANGE")
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProject) === false) {
      this.m_oProjectService.changeActiveProject(oProject.projectId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            this.m_oNotificationDisplayService.openSnackBar(oProject.name, sSetProject, 'success-snackbar');

            this.m_oSelectedProject = oProject;
            this.m_oConstantsService.setActiveProject(oProject);
          }
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("ROOT_PROJECT_CHANGE_ERROR"), '', 'danger')
        }
      });
    }
  }

  openFeedbackDialog() {
    this.m_oDialog.open(FeedbackDialogComponent, {
      height: '700px',
      width: '600px'
    });
  }
  goToSubscriptions() {
    this.m_oRouter.navigateByUrl("subscriptions");
  }

  logout() {
    this.m_oAuthService.logout();
    this.m_oConstantsService.logOut();
  }

  openDocs() {
    window.open('https://discord.gg/FkRu2GypSg', '_blank')
  }
}




