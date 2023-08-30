import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ConstantsService } from 'src/app/services/constants.service';
import { FeedbackService } from 'src/app/services/api/feedback.service';
import { ProjectService } from 'src/app/services/api/project.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

import { faComment, faArrowLeft, faBook, faFloppyDisk, faCalendar, faMagnifyingGlass, faGlobe, faGears, faRocket, faUserAstronaut, faGauge, faArrowRightFromBracket, faCertificate, faStar } from '@fortawesome/free-solid-svg-icons';

import { MatDialog } from '@angular/material/dialog';
import { UserSettingsDialogComponent } from './header-dialogs/user-settings-dialog/user-settings-dialog.component';

import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  sActiveWorkspaceId: string | null = null;
  sActiveRoute: string;
  m_bEditIsActive: boolean;
  m_oActiveWorkspace: Workspace;
  m_oUser: User;

  m_bLoadingProjects: boolean = false;

  m_aoUserProjects: Array<any> = [];
  m_aoUserProjectsMap: Array<any> = [];
  m_oProject: any;
  m_oSelectedProject: any = { name: "No Active Project", projectId: null };

  m_sUserAccount: string = "";

  m_oFeedback: {
    title: string | null,
    message: string | null
  } = { title: null, message: null }

  //Font Awesome Icons
  faUser = faUserAstronaut;
  faComment = faComment
  faArrowLeft = faArrowLeft;
  faDocumentation = faBook;
  faSpaceShip = faRocket;
  faFloppyDisk = faFloppyDisk;
  faCalendar = faCalendar;
  faMagnifyingGlass = faMagnifyingGlass;
  faGlobe = faGlobe;
  faGears = faGears;
  faGauge = faGauge;
  faLogout = faArrowRightFromBracket;
  faCertificate = faCertificate;
  faStar = faStar;

  constructor(
    private m_oActivatedRoute: ActivatedRoute,
    private m_oAlertDialog: AlertDialogTopService,
    public m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFeedbackService: FeedbackService,
    private m_oProjectService: ProjectService,
    public oRouter: Router,
    private m_oNotificationDisplayService: NotificationDisplayService,
    public translate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
  ) {
    //Register translation languages:
    translate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.sActiveWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    this.m_oUser = this.m_oConstantsService.getUser();
    this.initializeProjectsInfo();
    this.getAccountType();

    if (this.m_oActivatedRoute.snapshot.url[0].path === 'edit') {
      this.m_bEditIsActive = true;
      this.sActiveWorkspaceId = this.m_oActivatedRoute.snapshot.params['workspaceId'];
      this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
      this.m_oWorkspaceService.getWorkspaceEditorViewModel(this.sActiveWorkspaceId).subscribe(oResponse => {
        this.m_oActiveWorkspace = oResponse;
      });
    } else {
      this.m_bEditIsActive = false;
    }
  }

  logout() {
    this.m_oConstantsService.logOut();
    this.oRouter.navigateByUrl("login");
  }

  openUserSettings(event: MouseEvent) {
    const oDialogRef = this.m_oDialog.open(UserSettingsDialogComponent, {
      height: '85vh',
      width: '80vw'
    })
    event.preventDefault();
  }

  sendFeedback() {
    if (typeof this.m_oFeedback === undefined || !this.m_oFeedback.title || !this.m_oFeedback.message) {
      console.log("Error sending message");
      return false;
    }

    this.m_oFeedbackService.sendFeedback(this.m_oFeedback).subscribe(oResponse => {
      if (typeof oResponse !== null && typeof oResponse !== undefined && oResponse.boolValue === true) {
        console.log("feedback sent")
        return true;
      } else {
        console.log("error sending feedback");
        return false;
      }
    });
    return true;
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
          this.m_bLoadingProjects = false;
        } else {
          this.m_oAlertDialog.openDialog(4000, "Error in getting your projects");
          this.m_bLoadingProjects = false;
          this.m_oProject = oFirstProjectElement;

        }
      },
      error: oError => {
        let sErrorMessage = "Error in getting your projects";
        this.m_oProject = oFirstProjectElement;
        this.m_oAlertDialog.openDialog(4000, sErrorMessage);
      }
    })


  }

  setActiveProject(oProject: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProject) === false) {
      this.m_oProjectService.changeActiveProject(oProject.projectId).subscribe({
        next: oResponse => {
          if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
            this.m_oNotificationDisplayService.openSnackBar("Active Project Changed", "Close", "right", "bottom");

            this.m_oSelectedProject = oProject;
            this.m_oConstantsService.setActiveProject(oProject);
            this.initializeProjectsInfo();
          }
        },
        error: oError => { }
      })
    }
  }

  getAccountType() {
    this.m_sUserAccount = this.m_oUser.type;
  }
}
