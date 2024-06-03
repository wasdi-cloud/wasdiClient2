import { Component, Inject, OnInit } from '@angular/core';

//Import Services:
import { ProjectService } from 'src/app/services/api/project.service';

//Import Angular Materials
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-project-info-dialog',
  templateUrl: './project-info-dialog.component.html',
  styleUrls: ['./project-info-dialog.component.css']
})
export class ProjectInfoDialogComponent implements OnInit {
  m_bEditMode: boolean;
  m_oSubscription: any;
  m_oProject?: any = {
    activeProject: false,
    description: "",
    name: "",
    projectId: "",
    subscriptionName: ""
  };

  m_oEditProject = {
    activeProject: false,
    description: "",
    name: "",
    projectId: "",
    subscriptionName: "",
    subscriptionId: ""
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<ProjectInfoDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProjectService: ProjectService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.m_bEditMode = this.m_oData.bEditMode;
    this.m_oSubscription = this.m_oData.subscription;
    
    if (this.m_bEditMode === true) {
      this.m_oEditProject = this.m_oData.project;
      this.m_oProject = this.m_oData.project
    }

    if (FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oEditProject.projectId)) {
      this.m_oEditProject.subscriptionId = this.m_oSubscription.subscriptionId;
    }

    if (this.m_bEditMode === true) {
      this.m_oEditProject.subscriptionId = this.m_oSubscription.subscriptionId
    }

    this.m_oEditProject.subscriptionName = this.m_oSubscription.name;
  }

  saveProject() {
    this.m_oProjectService.saveProject(this.m_oEditProject).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
          if (oResponse.status === 200) {
            this.m_oNotificationDisplayService.openSnackBar(this.m_oTranslate.instant("DIALOG_USER_PROJECTS_SAVED"), this.m_oTranslate.instant("KEY_PHRASES.SUCCESS"), 'success-snackbar');
            if (this.m_oEditProject.activeProject === true) {
              this.m_oProjectService.changeActiveProject(oResponse.body.message).subscribe({
                next: oResponse => { },
                error: oError => { }
              })
            }
          } else {
            this.m_oNotificationDisplayService.openAlertDialog(this.m_oTranslate.instant("DIALOG_USER_PROJECTS_ERROR"), this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger')
          }
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(oError.error.message, this.m_oTranslate.instant("KEY_PHRASES.ERROR"), 'danger')
      }
    })
  }

  getDescription(oEvent) {
    this.m_oEditProject.description = oEvent.target.value;
  }


  onDismiss() {
    this.m_oDialogRef.close()
  }
}
