import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { faBook, faDownload, faEdit, faPaintBrush, faPlay, faPlus, faQuestionCircle, faRocket, faX } from '@fortawesome/free-solid-svg-icons';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { ParamsLibraryDialogComponent } from './params-library-dialog/params-library-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ConstantsService } from 'src/app/services/constants.service';
import { NewAppDialogComponent } from '../new-app-dialog/new-app-dialog.component';

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
  faRun = faPlay;
  faHelp = faQuestionCircle;
  faRocket = faRocket;

  m_sActiveUserId: string = ""
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
  m_oSelectedProcessor: any;


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<AppsDialogComponent>,
    private m_oProcessorService: ProcessorService,
    private m_oProductService: ProductService,
    private m_oWorkspaceService: WorkspaceService,
  ) {
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    this.getProcessorsList();

  }

  getProcessorsList() {
    this.m_bIsLoadingProcessorList = true;

    this.m_oProcessorService.getProcessorsList().subscribe(oResponse => {
      if (oResponse) {
        this.m_aoProcessorList = this.setDefaultImages(oResponse);
        this.m_bIsLoadingProcessorList = false;
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

  selectProcessor(oProcessor) {
    this.m_oSelectedProcessor = oProcessor;

    if (oProcessor.paramsSample) {
      this.m_sMyJsonString = decodeURIComponent(oProcessor.paramsSample);

      try {
        let oParsed = JSON.parse(this.m_sMyJsonString);

        let sPrettyPrint = JSON.stringify(oParsed, null, 2);

        this.m_sMyJsonString = sPrettyPrint;
      } catch (oError) {

      }
    } else {
      this.m_sMyJsonString = "";
    }
  }

  openParametersDialog(oEvent: MouseEvent, oProcessor) {
    oEvent.preventDefault();
    let oDialog = this.m_oDialog.open(ParamsLibraryDialogComponent, {
      height: '80vh',
      width: '80vw',
      data: oProcessor
    })

    oDialog.afterClosed().subscribe(oResult => {
      if (oResult) {
        this.m_sMyJsonString = decodeURIComponent(oResult.jsonParameters)
      }
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
    let oDialog = this.m_oDialog.open(NewAppDialogComponent, {
      height: '80vh',
      width: '80vw'
    })
  }

  removeProcessor(oEvent: MouseEvent, oProcessor: any) {
    if (!oProcessor) {
      return false;
    }

    let sConfirmOwner = `Are you sure you want to delete ${oProcessor.processorName}?`;
    let sConfirmShared = `Are you sure you want to remove your permissions from ${oProcessor.processorName}?`

    let oDialogData: ConfirmationDialogModel;
    if (oProcessor.sharedWithMe) {
      oDialogData = new ConfirmationDialogModel("Confirm Removal", sConfirmShared)
    } else {
      oDialogData = new ConfirmationDialogModel("Confirm Removal", sConfirmOwner)
    }

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    })

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      this.m_bIsLoadingProcessorList = true
      if (oDialogResult === true) {
        this.m_oProcessorService.deleteProcessor(oProcessor.processorId).subscribe(oResponse => {
          this.m_bIsLoadingProcessorList = true;
          this.getProcessorsList();
        });
      }
      this.m_bIsLoadingProcessorList = false;
    });
    return true;
  }

  formatJSON() {
    this.m_sMyJsonString = JSON.stringify(JSON.parse(this.m_sMyJsonString.replaceAll("'", '"')), null, 2);
  }

  runProcessor() {
    console.log(`RUN - ${this.m_oSelectedProcessor.processorName}`);

    let sJSON = this.m_sMyJsonString;

    let sStringJSON = "";

    if (typeof sJSON !== "string") {
      sStringJSON = JSON.stringify(sJSON);
    } else {
      sStringJSON = sJSON;
    }

    try {
      JSON.parse(sStringJSON);
    } catch (oError) {
      let sErrorMessage = "INVALID JSON INPUT PARAMETERS<br>" + oError.toString();

      console.log(sErrorMessage);
    }

    this.m_oProcessorService.runProcessor(this.m_oSelectedProcessor.processorName, sStringJSON).subscribe(oResponse => {
      console.log(oResponse)

      this.m_oDialogRef.close();
    })
  }

  openHelp() {
    this.m_oProcessorService.getHelpFromProcessor(this.m_oSelectedProcessor.processorName).subscribe(oResponse => {
      if (oResponse.stringValue) {
        let sHelpMessage = oResponse.stringValue;
        if (sHelpMessage) {
          try {
            let oHelp = JSON.parse(sHelpMessage);

            sHelpMessage = oHelp.help
          } catch (oError) {
            sHelpMessage = oResponse.stringValue;
          }
        } else {
          sHelpMessage = "";
        }
        //If the message is empty from the server or is null
        if (sHelpMessage === "") {
          sHelpMessage = "There isn't any help message."
        }

      }
    })
  }

  onDismiss() {
    this.m_oDialogRef.close();
  }
}
