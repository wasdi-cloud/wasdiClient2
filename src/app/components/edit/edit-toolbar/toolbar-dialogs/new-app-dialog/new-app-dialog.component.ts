import { Component, Inject } from '@angular/core';
import { faRocket, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  m_bEditMode: boolean;

  m_sActiveTab = "PROCESSOR"; 
  m_oProcessor: any; 

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<NewAppDialogComponent>,
    private m_oProcessorService: ProcessorService,
    private m_oWorkspaceService: WorkspaceService) {
    this.m_bEditMode = data.editMode;
    if(data.oProcessor) {
      this.m_oProcessor = data.oProcessor;
    }
  }

  changeActiveTab(sTabName: string) {
    if (sTabName) {
      this.m_sActiveTab = sTabName;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
