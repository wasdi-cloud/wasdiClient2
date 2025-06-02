import { Component, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

//Import Services: 
import { ConstantsService } from 'src/app/services/constants.service';
import { FeedbackService } from 'src/app/services/api/feedback.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Import Dialog Components:
import { MatDialog } from '@angular/material/dialog';

//Import Models:
import { User } from 'src/app/shared/models/user.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

import { NewWorkspaceDialogComponent } from '../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { MenuItems, Documentation } from './menu-list-item/menu-items';

//Import Utilities: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  m_bIsNavbarOpen: boolean = false;

  sActiveWorkspaceId: string | null = null;
  sActiveRoute: string;
  m_bEditIsActive: boolean = false;
  m_oActiveWorkspace: Workspace;
  m_oUser: User;

  m_sUserAccount: string = "";

  m_oRouterEvents: any;

  m_sSelectedTab: string = 'marketplace'

  m_aoMenuItems = MenuItems;
  m_oDocumentation = Documentation;

  m_sLogoImage = '/assets/icons/logo-only.svg';
  private m_oSkinSubscription: Subscription;

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFeedbackService: FeedbackService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oRouter: Router,
    public m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
  ) {
    //Register translation languages:
    m_oTranslate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    m_oTranslate.setDefaultLang('en');
  }

  translateLanguageTo(lang: string) {
    this.m_oTranslate.use(lang)
  }

  ngOnInit(): void {
    this.sActiveWorkspaceId = this.m_oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    this.m_oUser = this.m_oConstantsService.getUser();
    this.m_sLogoImage = this.m_oConstantsService.getSkin().logoImage;

    this.m_oSkinSubscription = this.m_oConstantsService.m_oSkin$.subscribe(oSkin => {
      if (oSkin) {
        this.m_sLogoImage = oSkin.logoImage;
      }
    });

    const m_oCurrentSkin = this.m_oConstantsService.getSkin();
    if (m_oCurrentSkin) {
      this.m_sLogoImage = m_oCurrentSkin.logoImage;
    }

    if (this.m_sLogoImage.includes('coplac')) {
    
    }

    this.getAccountType();

    this.m_oConstantsService.m_oActiveWorkspaceSubscription.subscribe(oWorkspace => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace)) {
        this.m_oActiveWorkspace = null;
        this.m_bEditIsActive = false;
      } else {
        this.m_oActiveWorkspace = oWorkspace;
        this.sActiveWorkspaceId = oWorkspace.workspaceId;
      }
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
              this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("EDITOR_WORKSPACE_REFRESH_ERROR"), '', 'alert')
            }
          })
        } else if (oEvent.url.includes('appDetails') || oEvent.url.includes('appui')) {
          this.setActiveTab('marketplace')
        } else if (oEvent.urlAfterRedirects === "/marketplace") {
          this.setActiveTab('marketplace')
        } else {
          this.setActiveTab(oEvent.url.slice(1));
        }
      }
    });
  }

  setActiveTab(sActiveTab: string) {
    this.m_sSelectedTab = sActiveTab;
  }

  logout() {
    this.m_oConstantsService.logOut();
    this.m_oRouter.navigateByUrl("login");
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

  ngOnDestroy(): void {
    if (this.m_oSkinSubscription) {
      this.m_oSkinSubscription.unsubscribe();
    }
    if (this.m_oRouterEvents) {
      this.m_oRouterEvents.unsubscribe();
    }
  }  
}
