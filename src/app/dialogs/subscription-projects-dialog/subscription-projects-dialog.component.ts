import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProjectService } from 'src/app/services/api/project.service';
import { ProjectInfoDialogComponent } from '../project-info-dialog/project-info-dialog.component';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';

@Component({
  selector: 'app-subscription-projects-dialog',
  templateUrl: './subscription-projects-dialog.component.html',
  styleUrls: ['./subscription-projects-dialog.component.css']
})
export class SubscriptionProjectsDialogComponent implements OnInit {
  m_oSubscription: any;
  m_aoProjects: Array<any> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<SubscriptionProjectsDialogComponent>,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProjectService: ProjectService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
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
          this.m_oProcessWorkspaceService.getProcessWorkspaceTimeByProject().subscribe({
            next: oResponse => {
              if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === true) {
                this.m_oNotificationDisplayService.openAlertDialog("Error in getting total processing time for your projects");
                return false;
              } else {
                this.m_aoProjects.forEach(oProject => {
                  oResponse.forEach(oProjectInfo => {
                    if (oProject.projectId === oProjectInfo.projectId) {
                      oProject["totalProcessingTime"] = oProjectInfo.computingTime;
                    }
                  })
                })
                return true;
              }
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Error in getting total processing time for your projects");
            }
          })
          this.m_oProcessWorkspaceService.getProcessWorkspaceTimeByUser().subscribe({
            next: oResponse => {
              if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === true) {
                this.m_oNotificationDisplayService.openAlertDialog("Error in getting individual processing time for your projects");
                return false;
              } else {
                this.m_aoProjects.forEach(oProject => {
                  oResponse.forEach(oProjectInfo => {
                    if (oProject.projectId === oProjectInfo.projectId) {
                      oProject["individualProcessingTime"] = oProjectInfo.computingTime;
                    }
                  })
                })
                return true;
              }
            },
            error: oError => {
              this.m_oNotificationDisplayService.openAlertDialog("Error in getting individual processing time for your projects");
            }
          })
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in getting your projects");
      }
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
              this.m_oNotificationDisplayService.openSnackBar("Project Deleted");
            } else {
              this.m_oNotificationDisplayService.openSnackBar("Error in Deleting Project");
            }
            this.getProjects();
          },
          error: oError => {
            let sErrorMsg: string;
            if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oError) && !FadeoutUtils.utilsIsStrNullOrEmpty(oError.message)) {
              sErrorMsg = this.m_oTranslate.instant(oError.message);
            }

            this.m_oNotificationDisplayService.openSnackBar(sErrorMsg);
          }
        })
      }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
