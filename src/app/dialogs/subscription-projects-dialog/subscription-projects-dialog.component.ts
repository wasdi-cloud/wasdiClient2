import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faEdit, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProjectService } from 'src/app/services/api/project.service';
import { ProjectInfoDialogComponent } from '../project-info-dialog/project-info-dialog.component';

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
    private m_oProjectService: ProjectService
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

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
