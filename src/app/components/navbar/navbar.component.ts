import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

//Import Services: 
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { FeedbackService } from 'src/app/services/api/feedback.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProjectService } from 'src/app/services/api/project.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Import Dialog Components:
import { MatDialog } from '@angular/material/dialog';
import { UserSettingsDialogComponent } from '../header/header-dialogs/user-settings-dialog/user-settings-dialog.component';

//Import Models:
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

//Import Utilities: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NewWorkspaceDialogComponent } from '../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { faArrowLeft, faArrowRightFromBracket, faBars } from '@fortawesome/free-solid-svg-icons';
import { HeaderService } from 'src/app/services/header.service';



@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  faBars = faBars;
  faArrowLeft = faArrowLeft;
  faLogout = faArrowRightFromBracket;
  m_bIsNavbarOpen: boolean = false;

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

  m_oRouterEvents: any;

  m_sSelectedTab: string = 'marketplace'

  constructor(private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFeedbackService: FeedbackService,
    private m_oHeaderService: HeaderService,
    private m_oProjectService: ProjectService,
    private m_oRouter: Router,
    private m_oNotificationDisplayService: NotificationDisplayService,
    public m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
  ) {
    //Register translation languages:
    m_oTranslate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    m_oTranslate.setDefaultLang('en');


  }

  translateLanguageTo(lang: string) {
    console.log("TRANSLATE")
    this.m_oTranslate.use(lang)
  }


  ngOnInit(): void {
    this.sActiveWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    console.log(this.m_oActiveWorkspace);
    this.m_oUser = this.m_oConstantsService.getUser();
    this.initializeProjectsInfo();
    this.getAccountType();
    console.log(this.m_sUserAccount);

    this.m_oRouterEvents = this.m_oRouter.events.subscribe((oEvent: any) => {
      if (oEvent instanceof NavigationEnd) {

        if (oEvent.url.includes('edit')) {
          this.sActiveWorkspaceId = oEvent.url.slice(6);
          this.m_bEditIsActive = true;
          this.m_oWorkspaceService.getWorkspaceEditorViewModel(this.sActiveWorkspaceId).subscribe({
            next: oResponse => {
              this.m_oActiveWorkspace = oResponse;
            },
            error: oError => {
              this.m_oAlertDialog.openDialog(4000, "Error in retreiving Workspace Information")
            }
          })
        } else {
          this.m_bEditIsActive = false;
          this.setActiveTab(oEvent.url.slice(1));
        }
      }
    })
  }

  setActiveTab(sActiveTab: string) {
    this.m_sSelectedTab = sActiveTab;
    this.m_oHeaderService.setLocation(sActiveTab);
  }

  logout() {
    this.m_oConstantsService.logOut();
    this.m_oRouter.navigateByUrl("login");
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
    });
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
      });
    }
  }

  reNameWorkspace(oInputWorkspace) {
    let oDialog = this.m_oDialog.open(NewWorkspaceDialogComponent, {
      width: '30vw',
      data: {
        renameWorkspace: true,
        workspace: oInputWorkspace
      }
    });
  }

  getAccountType() {
    this.m_sUserAccount = this.m_oUser.type;
  }
  openCloseNavbar() {
    this.m_bIsNavbarOpen = !this.m_bIsNavbarOpen;
  }
}
