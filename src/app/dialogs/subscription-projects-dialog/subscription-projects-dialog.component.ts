import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faEdit, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProjectService } from 'src/app/services/api/project.service';
import { ProjectInfoDialogComponent } from '../project-info-dialog/project-info-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-projects-dialog',
  templateUrl: './subscription-projects-dialog.component.html',
  styleUrls: ['./subscription-projects-dialog.component.css']
})
export class SubscriptionProjectsDialogComponent implements OnInit {
  faPlus = faPlus;
  faX = faX;
  faEdit = faEdit;

  m_oSubscription: any;
  m_aoProjects: Array<any> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<SubscriptionProjectsDialogComponent>,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProjectService: ProjectService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData.subscription)) {
      this.m_oSubscription = this.m_oData.subscription;
    }
    this.getProjects();
  }

  getProjects() {
    this.m_oProjectService.getProjectsListBySubscription(this.m_oSubscription.subscriptionId).subscribe({
      next: oResponse => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoProjects = oResponse;
          console.log(oResponse);
        }
      },
      error: oError => { }
    })
  }

  //Opens the Project Info Dialog in either Edit Mode or Creation Mode
  openProjectInfoDialog(bIsEditing: boolean, oSubscription: any, oProject?: any) {
    let oDialog = this.m_oDialog.open(ProjectInfoDialogComponent, {
      height: '50vh',
      width: '40vw',
      data: {
        bEditMode: bIsEditing,
        subscription: oSubscription,
        project: oProject
      }
    })

    oDialog.afterClosed().subscribe(() => {
      this.getProjects();
    })
  }

  removeProject(oProject) {

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(`Are you sure you want to delete ${oProject.name}`);

    bConfirmResult.subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oProjectService.deleteProject(oProject.projectId).subscribe({
          next: oResponse => {
            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) && oResponse.status === 200) {
              this.m_oNotificationDisplayService.openSnackBar("Project Deleted", "Close", "bottom", "right");
            } else {
              this.m_oNotificationDisplayService.openSnackBar("Error in Deleting Project", "Close", "bottom", "right");
            }
            this.getProjects();
          },
          error: oError => {
            let sErrorMsg: string;
            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.message)) {
              sErrorMsg = this.m_oTranslate.instant(oError.message);
            }

            this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, "Close", "bottom", "right");
          }
        })
      }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
