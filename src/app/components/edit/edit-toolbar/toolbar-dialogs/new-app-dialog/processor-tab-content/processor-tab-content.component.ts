import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { TranslateService } from '@ngx-translate/core';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

//Angular Material Import: 
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
//Model Imports:
import { Workspace } from 'src/app/shared/models/workspace.model';

//Component Imports
import { PackageManagerComponent } from 'src/app/dialogs/package-manager/package-manager.component';

//Fadeout Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


@Component({
  selector: 'app-processor-tab-content',
  templateUrl: './processor-tab-content.component.html',
  styleUrls: ['./processor-tab-content.component.css']
})
export class ProcessorTabContentComponent implements OnInit {
  /**
    * Active Workspace
    */
  m_oActiveWorkspace: Workspace;

  /**
    * Processor Name
    */
  m_sName: string = "";

  /**
   * Processor Description
   */
  m_sDescription: string = "";

  /**
   * Processor Version
   */
  m_sVersion: string = "1";

  /**
   * JSON Input Parameters Sample
   */
  m_sJSONSample: string = "{}";

  /**
   * Selected Processor Type
   */
  m_oSelectedType: { name: string, id: string } = {} as { name: string, id: string };

  /**
   * Name of the Type of a processor in edit mode
   */
  m_sTypeNameOnly: string = "";

  /**
   * Id of the Type of a processor in edit mode
   */
  m_sTypeIdOnly = "";

  /**
   * Public processor flag
   */
  m_bIsPublic = false;

  /**
   * Time Out in Minutes
   */
  m_iMinuteTimeout: number = 180;

  /**
   * Environment Update Command
   */
  m_sEnvUpdCommand: string = "";

  /**
   * Edit Mode status
   */
  @Input() m_bEditMode: boolean = false;

  /**
   * Processor Id
   */
  @Input() m_sProcessorId?: string = "";

  /**
   * Processor Name
   */
  @Input() m_sProcessorName?: string = "";

  @Input() m_sPublisher?: string = "";

  @Input() m_bRedeployOngoing?: boolean = false;


  /**
   * Selected File
   */
  m_oSelectedFile: any = null;

  /**
   * Selected File Name
   */
  m_sSelectedFileName: string;

  /**
   * Is the build log component currently being shown? 
   */
  m_bShowBuildLogs: boolean = false;

  @Input() m_oProcessorBasicInfo: FormGroup;

  m_asBuildLogs: Array<any> = [];
  m_sBuildLogs: string = "";

  m_aoProcessorTypes = [
    { name: "Ubuntu 22.04 + Python 3.10", id: "python_pip_2" },
    { name: "Python 3.x Pip One Shot", id: "pip_oneshot" },
    { name: "OGC Application Package", id: "eoepca" },
    { name: "IDL 3.7.2", id: "ubuntu_idl372" },
    { name: "OCTAVE 6.x", id: "octave" },
    { name: "Ubuntu 20.04 + Python 3.8", id: "python_pip_2_ubuntu_20" },
    { name: "Python 3.x Conda", id: "conda" },
    { name: "C# .NET Core", id: "csharp" }//,
    //{ name: "Ubuntu 20.04 + Python 3.8 - Deprecated", id: "ubuntu_python37_snap" }
  ];

  m_aoProcessorTypesMap = this.m_aoProcessorTypes.map(oProcessorType => {
    return oProcessorType.name;
  })

  m_iHookIndex = this.m_oRabbitStompService.addMessageHook("INFO", this, this.rabbitMessageHook, true);

  constructor(
    private m_oClipboard: Clipboard,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService,
    private m_oRabbitStompService: RabbitStompService,
    private m_oTranslate: TranslateService) {
  }

  ngOnInit(): void {
    //Set the active workspace from the constants service
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();

    this.displayProcessorType();
    // let sType = this.m_oProcessorBasicInfo.get('oType').value;
    // this.m_aoProcessorTypes.forEach(type => {
    //   if (type.id === sType) {
    //     sType = type.name
    //     this.m_oProcessorBasicInfo.controls['oType'].setValue(sType)
    //   }
    // })

    //Set ui for isPublic flag
    if (this.m_oProcessorBasicInfo.get('bIsPublic').value === 0) {
      this.m_bIsPublic = false
    } else {
      this.m_bIsPublic = true
    }

    if (this.m_oProcessorBasicInfo.get('iMinuteTimeout')) {
      this.m_iMinuteTimeout = parseInt(this.m_oProcessorBasicInfo.get('iMinuteTimeout').value)
    }
    if (this.m_oProcessorBasicInfo.get('sJSONSample')) {
      this.m_sJSONSample = this.m_oProcessorBasicInfo.get('sJSONSample').value;
    }

    if (this.m_oProcessorBasicInfo.get('sProcessorName')) {
      this.m_sProcessorName = this.m_oProcessorBasicInfo.get('sProcessorName').value
    }
  }

  ngOnDestroy() {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }

  /**
   * Utility method to define if the drag and drop box can be shown or not
   * @returns {boolean}
   */
  showDragAndDrop() {
    if (this.m_bEditMode === false) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Utility method to test JSON Validity
   * @param sJsonString
   * @returns {boolean|any}
   */
  tryParseJSON(sJsonString: string) {
    try {
      var oJsonParsedObject = JSON.parse(sJsonString);

      if (oJsonParsedObject && typeof oJsonParsedObject === "object") {
        return oJsonParsedObject;
      }
    } catch (e) { }

    return false;
  };

  setSelectedType(oEvent: any) {
    this.m_aoProcessorTypes.forEach(oType => {
      if (oType.name === oEvent.name) {
        this.m_oProcessorBasicInfo.patchValue({
          oType: oType
        })
      }
    });
  }

  onFileSelect(input: any) {
    if (input['0']) {
      let oInput = input['0'];
      this.m_sSelectedFileName = oInput.name;
      this.m_oSelectedFile = new FormData();
      this.m_oSelectedFile.append('file', oInput);

      this.m_oProcessorBasicInfo.patchValue({
        oSelectedFile: this.m_oSelectedFile,
        sSelectedFileName: this.m_sSelectedFileName
      })
    }
  }

  getSelectedFile(oEvent) {
    this.m_oProcessorBasicInfo.patchValue({
      oSelectedFile: oEvent.file,
      sSelectedFileName: oEvent.name
    })
  }

  /**
   * Get the correct processor type
   */
  displayProcessorType() {
    this.m_aoProcessorTypes.forEach(oType => {
      if (oType.id === this.m_oProcessorBasicInfo.get('oType').value) {
        this.m_sTypeNameOnly = oType.name;
        this.m_sTypeIdOnly = oType.id;
      }
    })
  }

  forceLibUpdate(sProcessorId: string) {
    let sUpdateMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_BASE_LIB_SCHEDULE")
    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_BASE_LIB_ERROR")
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProcessorId) === false) {
      this.m_oProcessorService.forceLibUpdate(sProcessorId).subscribe({
        next: oResponse => {
          this.m_oNotificationDisplayService.openSnackBar(sUpdateMsg, '', 'success-snackbar');
        },
        error: oError => {
          this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger')
        }
      })
    }
  }

  forceProcessorRefresh(sProcessorId: string) {
    let sConfirmMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_BASE_REFRESH_CONFIRM");
    let sSuccessMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_BASE_REFRESH_SUCCESS")
    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_BASE_REFRESH_ERROR")
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProcessorId)) {
      return false;
    }

    this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmMsg).subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oProcessorService.redeployProcessor(sProcessorId).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar(sSuccessMsg, '', 'success-snackbar');
            this.m_bRedeployOngoing = true;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger')
          }

        })
      }
    });
    return true;
  }

  /**
   * Open Package Manager Dialog
   */
  openPackageManager() {
    this.m_oDialog.open(PackageManagerComponent, {
      height: '90vh',
      width: '90vw',
      maxWidth: '1500px',
      data: {
        sProcessorId: this.m_sProcessorId,
        sProcessorName: this.m_sProcessorName
      }
    });
  }


  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.onFileSelect($event);
  }

  onPublicChange(event) {
    let oForm = this.m_oProcessorBasicInfo;
    if (event.target.checked) {
      oForm.patchValue({
        bIsPublic: true
      })
    } else {
      oForm.patchValue({
        bIsPublic: false
      })
    }
  }

  onTextareaInput(oEvent) {
    this.m_oProcessorBasicInfo.patchValue({
      sShortDescription: oEvent.target.value
    })
  }

  onJsonInput(oEvent) {
    this.m_oProcessorBasicInfo.patchValue({
      sJSONSample: oEvent
    })
  }

  showBuildLogs(bShowLogs: boolean) {
    this.m_bShowBuildLogs = bShowLogs

    if (this.m_bShowBuildLogs === true) {
      this.getProcessorBuildLogs(this.m_sProcessorId);
    }
  }

  getProcessorBuildLogs(sProcessoId: string) {
    this.m_oProcessorService.getProcessorLogsBuild(sProcessoId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_sBuildLogs = oResponse;
          this.m_asBuildLogs = oResponse.map((sBuildLog, iIndex) => {
            return { logNumber: iIndex, logs: sBuildLog.split("Step"), isOpen: false }
          })
        }
      },
      error: oError => { }
    })
  }

  openBuildLog(oBuildLog) {
    oBuildLog.isOpen = !oBuildLog.isOpen;
  }

  copyBuildLogToClipboard(oBuildLog) {
    let sCopiedMsg = this.m_oTranslate.instant("KEY_PHRASES.CLIPBOARD")
    this.m_oClipboard.copy(oBuildLog);
    this.m_oNotificationDisplayService.openSnackBar(sCopiedMsg, '', 'success-snackbar')
  }

  downloadProcessor(sProcessorId: string) {
    this.m_oProcessorService.downloadProcessor(sProcessorId)
  }

  rabbitMessageHook(oRabbitMessage, oController): void {
    if (oRabbitMessage.messageResult === 'OK' && oRabbitMessage.payload.includes('Re Deploy Done')) {
      oController.m_bRedeployOngoing = false;
      console.log(oController.m_bRedeployOngoing)
    }
  }
}
