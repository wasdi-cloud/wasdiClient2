import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

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



@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFeedbackService: FeedbackService,
    private m_oProjectService: ProjectService,
    private m_oRouter: Router,
    private m_oNotificationDisplayService: NotificationDisplayService,
    public m_oTranslate: TranslateService,
    private m_oWorkspaceService: WorkspaceService,
  ) {

  }
}
