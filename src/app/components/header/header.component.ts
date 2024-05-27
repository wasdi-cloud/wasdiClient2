import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConstantsService } from 'src/app/services/constants.service';
import { FeedbackService } from 'src/app/services/api/feedback.service';
import { User } from 'src/app/shared/models/user.model';
import { UserSettingsDialogComponent } from './header-dialogs/user-settings-dialog/user-settings-dialog.component';
import { ProjectService } from 'src/app/services/api/project.service';

import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Router } from '@angular/router';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';

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

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProjectService: ProjectService,
    private m_oRouter: Router
  ) { }

  ngOnInit(): void {
    this.m_oUser = this.m_oConstantsService.getUser();
    this.initializeProjectsInfo();
    this.m_oProjectService.getProjectsListByUser().subscribe({
      next: oResponse => { },
      error: oError => { }
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
        // this.m_oAlertDialog.openDialog(4000, sErrorMessage);
      }
    });
  }

  setActiveProject(oProject: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProject) === false) {
      this.m_oProjectService.changeActiveProject(oProject.projectId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            this.m_oNotificationDisplayService.openSnackBar(`Changed project to ${oProject.name}`, "Active Project Changed");

            this.m_oSelectedProject = oProject;
            this.m_oConstantsService.setActiveProject(oProject);
            this.initializeProjectsInfo();
          }
        },
        error: oError => { }
      });
    }
  }


  openUserDashboard() {
    this.m_oDialog.open(UserSettingsDialogComponent);
  }

  openFeedbackDialog() {
    this.m_oDialog.open(FeedbackDialogComponent, {
      height: '70vh',
      width: '40vw'
    });
  }
  goToSubscriptions() {
    this.m_oRouter.navigateByUrl("subscriptions");
  }

  logout() {
    this.m_oConstantsService.logOut();
    this.m_oRouter.navigateByUrl("login");
  }

  openDocs() {
    window.open('https://discord.gg/FkRu2GypSg', '_blank')
  }
}




