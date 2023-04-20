import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faBook, faDownload, faEdit, faPaintBrush, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ParamsLibraryDialogComponent } from './params-library-dialog/params-library-dialog.component';
import { EditProcessorDialogComponent } from './edit-processor-dialog/edit-processor-dialog.component';

@Component({
  selector: 'app-apps-dialog',
  templateUrl: './apps-dialog.component.html',
  styleUrls: ['./apps-dialog.component.css']
})
export class AppsDialogComponent {
  //Font Awesome Icon Imports
  faX = faX;
  faDownload = faDownload;
  faEdit = faEdit;
  faPlus = faPlus;
  faPaintBrush = faPaintBrush;
  faBook = faBook;

  m_aoWorkspaceList: any[] = [];
  m_aWorkspacesName: any[] = [];
  m_aoSelectedWorkspaces: any[] = [];
  m_sFileName: string = "";
  m_aoProcessorList: any[] = [];
  m_bIsLoadingProcessorList: boolean = false;
  m_bIsJsonEditModeActive: boolean = false;
  m_sJson: any = {};
  m_sMyJsonString: string = "";
  m_sSearchString = ""


  constructor(
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<AppsDialogComponent>,
    private m_oProcessorService: ProcessorService,
    private m_oProductService: ProductService,
    private m_oWorkspaceService: WorkspaceService,
  ) {
    this.getProcessorsList();

  }

  getProcessorsList() {
    this.m_bIsLoadingProcessorList = true;

    this.m_oProcessorService.getProcessorsList().subscribe(oResponse => {
      if (oResponse) {
        this.m_aoProcessorList = this.setDefaultImages(oResponse);
        this.m_bIsLoadingProcessorList = false;
        console.log(this.m_aoProcessorList);
      } else {
        //ERROR DIALOG
      }
    });
  }

  setDefaultImages(aoProcessorList) {
    if (!aoProcessorList) {
      return aoProcessorList;
    }

    let sDefaultImage = "";
    let iNumberOfProcessors = aoProcessorList.lenght;

    for (let iIndexProcessor = 0; iIndexProcessor < iNumberOfProcessors; iIndexProcessor++) {
      if (!aoProcessorList.imgLink) {
        aoProcessorList[iIndexProcessor].imgLink = sDefaultImage
      }
    }
    return aoProcessorList;
  }

  openParametersDialog(oEvent: MouseEvent) {
    oEvent.preventDefault();
    let oDialog = this.m_oDialog.open(ParamsLibraryDialogComponent, {
      height: '80vh',
      width: '80vw'
    })
  }

  downloadProcessor(oEvent: MouseEvent, oProcessor: any) {
    oEvent.preventDefault();
    if (!oProcessor) {
      return false;
    }

    return this.m_oProcessorService.downloadProcessor(oProcessor.processorId);
  }

  openEditProcessorDialog(oEvent: MouseEvent, oProcessor: any) {
    let oDialog = this.m_oDialog.open(EditProcessorDialogComponent, {
      height: '80vh',
      width: '80vw'
    })
  }


  onDismiss() {
    this.m_oDialogRef.close();
  }
}
