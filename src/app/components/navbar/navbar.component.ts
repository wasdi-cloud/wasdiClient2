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

import { NewWorkspaceDialogComponent } from '../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { HeaderService } from 'src/app/services/header.service';
import { MenuItems, Documentation } from './menu-list-item/menu-items';

//Import Utilities: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  m_bIsNavbarOpen: boolean = false;

  sActiveWorkspaceId: string | null = null;
  sActiveRoute: string;
  m_bEditIsActive: boolean = false;
  m_oActiveWorkspace: Workspace;
  m_oUser: User;

  m_sUserAccount: string = "";

  m_oFeedback: {
    title: string | null,
    message: string | null
  } = { title: null, message: null }

  m_oRouterEvents: any;

  m_sSelectedTab: string = 'marketplace'

  m_aoMenuItems = MenuItems;
  m_oDocumentation = Documentation;

  constructor(
    private m_oAlertDialog: AlertDialogTopService,
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
    this.m_oUser = this.m_oConstantsService.getUser();
    this.getAccountType();

    this.m_oConstantsService.m_oActiveWorkspaceSubscription.subscribe(oWorkspace => {
      this.m_oActiveWorkspace = oWorkspace;
      this.sActiveWorkspaceId = oWorkspace.workspaceId;
    })

    this.m_oRouterEvents = this.m_oRouter.events.subscribe((oEvent: any) => {
      if (oEvent instanceof NavigationEnd) {
        if (oEvent.url.includes('edit')) {
          this.sActiveWorkspaceId = oEvent.url.slice(6);
          this.setActiveTab("edit")
          this.m_bEditIsActive = true;
          this.m_oWorkspaceService.getWorkspaceEditorViewModel(this.sActiveWorkspaceId).subscribe({
            next: oResponse => {
              this.m_oActiveWorkspace = oResponse;
            },
            error: oError => {
              this.m_oAlertDialog.openDialog(4000, "Error in retreiving Workspace Information")
            }
          })
        } else if (oEvent.url.includes('appDetails') || oEvent.url.includes('appui')) {
          this.setActiveTab('marketplace')
        } else {
          this.setActiveTab(oEvent.url.slice(1));
        }
      }
    });
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
}
