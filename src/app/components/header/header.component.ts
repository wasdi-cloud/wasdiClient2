import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { faUser, faComment, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { UserSettingsDialogComponent } from './header-dialogs/user-settings-dialog/user-settings-dialog.component';
import { User } from 'src/app/shared/models/user.model';
import { FeedbackService } from 'src/app/services/api/feedback.service';
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

  m_oFeedback: {
    title: string | null,
    message: string | null
  } = { title: null, message: null }

  //Font Awesome Icons
  faUser = faUser;
  faComment = faComment
  faArrowLeft = faArrowLeft;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    public oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oFeedbackService: FeedbackService,
    public oRouter: Router,
    public translate: TranslateService
  ) {
    //Register translation languages:
    translate.addLangs(['en', 'es', 'fr', 'it', 'de', 'vi', 'id', 'ro']);
    translate.setDefaultLang('en');
    this.sActiveWorkspaceId = this.oConstantsService.getActiveWorkspace().workspaceId;
    this.m_oActiveWorkspace = this.oConstantsService.getActiveWorkspace()
    this.m_oUser = this.oConstantsService.getUser();
    console.log(this.m_oUser)
  }

  ngOnInit(): void {
    if (this.oActivatedRoute.snapshot.url[0].path === 'edit') {
      this.m_bEditIsActive = true;
    } else {
      this.m_bEditIsActive = false;
    }

  }

  logout() {
    this.oConstantsService.logOut();
    this.oRouter.navigateByUrl("login");
  }

  openUserSettings(event: MouseEvent) {
    console.log("Open User Settings")
    const oDialogRef = this.m_oDialog.open(UserSettingsDialogComponent, {
      height: '85vh',
      width: '60vw'
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

}
