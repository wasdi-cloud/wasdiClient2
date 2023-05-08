import { Component } from '@angular/core';
import { faRocket, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
@Component({
  selector: 'app-new-app-dialog',
  templateUrl: './new-app-dialog.component.html',
  styleUrls: ['./new-app-dialog.component.css']
})
export class NewAppDialogComponent {
  //Font Awesome Imports
  faRocket = faRocket;
  faX = faXmark;

  m_bEditMode = false; 

  m_sActiveTab = "PROCESSOR"

  constructor(private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oProcessorService: ProcessorService,
    private m_oWorkspaceService: WorkspaceService) { }

  changeActiveTab(sTabName: string) {
    if (sTabName) {
      this.m_sActiveTab = sTabName;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
