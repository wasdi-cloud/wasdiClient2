import { Component, OnDestroy, OnInit } from '@angular/core';

//Angular Materials Modules: 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProcessWorkspaceService } from 'src/app/services/api/process-workspace.service';
import { ProductService } from 'src/app/services/api/product.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Components Imports:
import { NewAppDialogComponent } from '../new-app-dialog/new-app-dialog.component';
import { ParamsLibraryDialogComponent } from './params-library-dialog/params-library-dialog.component';

//Fadeout Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { Application } from 'src/app/components/app-ui/app-ui.component';


@Component({
  selector: 'app-apps-dialog',
  templateUrl: './apps-dialog.component.html',
  styleUrls: ['./apps-dialog.component.css']
})
export class AppsDialogComponent implements OnInit, OnDestroy {
  m_sActiveUserId: string = "";
  m_aoWorkspaceList: any[] = [];
  m_aWorkspacesName: any[] = [];
  m_aoSelectedWorkspaces: any[] = [];
  m_sFileName: string = "";
  m_aoProcessorList: any[] = [];
  m_bIsLoadingProcessorList: boolean = true;
  m_bIsJsonEditModeActive: boolean = false;
  m_sJson: any = {};
  m_sMyJsonString: string = "";
  m_sSearchString = ""
  m_oSelectedProcessor: any = {} as Application;
  m_bIsReadonly: boolean = true;

  m_iHookIndex = this.m_oRabbitStompService.addMessageHook(
    "DELETEPROCESSOR",
    this,
    this.rabbitMessageHook
  )


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<AppsDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oProcessWorkspaceService: ProcessWorkspaceService,
    private m_oProductService: ProductService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oWorkspaceService: WorkspaceService,
  ) { }

  ngOnInit(): void {
    this.m_sActiveUserId = this.m_oConstantsService.getUserId();
    this.m_bIsReadonly = this.m_oConstantsService.getActiveWorkspace().readOnly;
    this.getProcessorsList();
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }

  /**
   * Get the list of processors from the server
   */
  getProcessorsList() {
    this.m_oProcessorService.getProcessorsList().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoProcessorList = this.setDefaultImages(oResponse);
          this.m_bIsLoadingProcessorList = false;
        } else {
          this.m_oNotificationDisplayService.openAlertDialog("Error in getting processors");
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in getting processors");
      }
    });
  }

  /**
   * If the processor has a default image, set as image - otherwise use default image
   * @param aoProcessorList 
   * @returns 
   */
  setDefaultImages(aoProcessorList) {
    if (!aoProcessorList) {
      return aoProcessorList;
    }

    let sDefaultImage = "";
    let iNumberOfProcessors = aoProcessorList.length;

    for (let iIndexProcessor = 0; iIndexProcessor < iNumberOfProcessors; iIndexProcessor++) {
      if (!aoProcessorList.imgLink) {
        aoProcessorList[iIndexProcessor].imgLink = sDefaultImage

      }
    }
    return aoProcessorList;
  }

  /**
   * Set selected processor as active processor
   * @param oProcessor 
   */
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

  /**
   * Open the Processor Parameters Dialog
   * @param oEvent 
   * @param oProcessor 
   */
  openParametersDialog(oProcessor) {
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

  /**
   * Download the Processor file
   * @param oEvent 
   * @param oProcessor 
   * @returns 
   */
  downloadProcessor(oProcessor: any) {
    console.log(oProcessor)
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oProcessor)) {
      // return false;
    }

    return this.m_oProcessorService.downloadProcessor(oProcessor.processorId);
  }

  /**
   * Open Processor Editing Dialog
   * @param oEvent 
   * @param oProcessor 
   */
  openEditProcessorDialog(oProcessor: any) {
    this.m_oDialog.open(NewAppDialogComponent, {
      height: '80vh',
      width: '80vw',
      data: {
        editMode: true,
        inputProcessor: oProcessor
      }
    })
  }

  /**
   * Either Delete the processor or remove user permissions
   * @param oEvent 
   * @param oProcessor 
   * @returns 
   */
  removeProcessor(oProcessor: any) {
    if (!oProcessor) {
      return false;
    }

    let sConfirmOwner = `Are you sure you want to delete ${oProcessor.processorName}?`;
    let sConfirmShared = `Are you sure you want to remove your permissions from ${oProcessor.processorName}?`

    let bConfirmResult: any;

    if (oProcessor.sharedWithMe) {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmShared);
    } else {
      bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmOwner);
    }

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_bIsLoadingProcessorList = true;
        this.m_oProcessorService.deleteProcessor(oProcessor.processorId).subscribe({
          next: oResponse => {
            //Next actions are handled on RabbitMessageHook function
          },
          error: oError => { }
        }
        );
      }
    })
    return true;
  }

  /**
   * Format the JSON textbox
   */
  formatJSON() {
    try {
      this.m_sMyJsonString = JSON.stringify(JSON.parse(this.m_sMyJsonString.replaceAll("'", '"')), null, 3);
    } catch (oError) {
      this.m_oNotificationDisplayService.openAlertDialog("Could not format your JSON Input. Please ensure it is a valid JSON.")
    }
  }

  /**
   * Execute the processor in the active workspace
   */
  runProcessor() {
    if (this.m_oConstantsService.checkProjectSubscriptionsValid() === false) {
      return false;
    }

    if (this.m_bIsReadonly === true) {
      this.m_oNotificationDisplayService.openAlertDialog("You do not have permission to edit this workspace.");
      return false;
    }
    console.log(`RUN - ${this.m_oSelectedProcessor.processorName}`);

    let sJSON = this.m_sMyJsonString;

    let sStringJSON = "";

    if (typeof sJSON !== "string") {
      sStringJSON = JSON.stringify(sJSON);
    } else if (sJSON === '') {
      sStringJSON = '{}'
    } else {
      sStringJSON = sJSON;
    }

    try {
      JSON.parse(sStringJSON);
    } catch (oError) {
      let sErrorMessage = "INVALID JSON INPUT PARAMETERS<br>" + oError.toString();

      this.m_oNotificationDisplayService.openAlertDialog(sErrorMessage);
    }

    this.m_oProcessorService.runProcessor(this.m_oSelectedProcessor.processorName, sStringJSON).subscribe(oResponse => {
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
        let sNotificationMsg = "PROCESSOR SCHEDULED";
        this.m_oNotificationDisplayService.openSnackBar(sNotificationMsg, "Close", "right", "bottom")
      }
      this.m_oDialogRef.close();
    })

    return true;

  }

  /**
   * Open the help dialog
   */
  openHelp() {
    let sHelpMessage = ""
    this.m_oProcessorService.getHelpFromProcessor(this.m_oSelectedProcessor.processorName).subscribe(oResponse => {
      if (oResponse.stringValue) {
        sHelpMessage = oResponse.stringValue;
        if (sHelpMessage) {
          try {
            let oHelp = JSON.parse(sHelpMessage);

            sHelpMessage = oHelp
          } catch (oError) {
            sHelpMessage = oResponse.stringValue;
          }
        } else {
          sHelpMessage = "There isn't any help message."
        }
      } else {
        sHelpMessage = "The developer did not include a help message."
      }
      this.m_oDialog.open(HelpDialogComponent, {
        maxHeight: '70vh',
        maxWidth: '50vw',
        data: {
          helpMsg: sHelpMessage
        }
      })
    })
  }

  handleToolbarClick(oEvent, oProcessor) {
    switch (oEvent) {
      case 'params':
        this.openParametersDialog(oProcessor);
        break;
      case 'download':
        this.downloadProcessor(oProcessor);
        break;
      case 'edit':
        this.openEditProcessorDialog(oProcessor);
        break;
      default:
        this.removeProcessor(oProcessor)
    }
  }

  handleSearchChange(oEvent) {
    this.m_sSearchString = oEvent.event.target.value;
  }

  getJSONInput(oEvent) {

    this.m_sMyJsonString = oEvent.target.value;
  }
  /**
   * Close the Apps Dialog
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }

  rabbitMessageHook(oRabbitMessage: any, oController: any) {
    oController.getProcessorsList();
  }
}
