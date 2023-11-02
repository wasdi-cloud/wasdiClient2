import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

//Service Imports:
import { AlertDialogTopService } from 'src/app/services/alert-dialog-top.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

//Angular Material Import: 
import { MatDialog } from '@angular/material/dialog';
//Model Imports:
import { Workspace } from 'src/app/shared/models/workspace.model';

//Fadeout Utilities Import: 
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { PackageManagerComponent } from 'src/app/components/dialogs/package-manager/package-manager.component';

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
  m_sJSONSample: string = "";

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
  @Input() m_bEditMode: boolean;

  /**
   * Processor Id
   */
  @Input() m_sProcessorId?: string = "";

  /**
   * Processor Name
   */
  @Input() m_sProcessorName?: string = "";

  /**
   * Selected File
   */
  m_oSelectedFile: any = null;

  /**
   * Selected File Name
   */
  m_sSelectedFileName: string;

  @Input() m_oProcessorBasicInfo: FormGroup;

  m_aoProcessorTypes = [
    { name: "Ubuntu 22.04 + Python 3.10", id: "python_pip_2" },
    { name: "OGC Application Package", id: "eoepca" },
    //{ name: "Python 3.x Pip One Shot", id:"pip_oneshot"},
    { name: "IDL 3.7.2", id: "ubuntu_idl372" },
    { name: "OCTAVE 6.x", id: "octave" },
    { name: "Python 3.x Conda", id: "conda" },
    { name: "C# .NET Core", id: "csharp" },
    { name: "Ubuntu 20.04 + Python 3.8", id: "ubuntu_python37_snap" }
  ];

  m_aoProcessorTypesMap = this.m_aoProcessorTypes.map(oProcessorType => {
    return oProcessorType.name;
  })


  constructor(
    private m_oAlertDialog: AlertDialogTopService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationDisplayService,
    private m_oProcessorService: ProcessorService) {
  }

  ngOnInit(): void {
    //Set the active workspace from the constants service
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
    
    this.displayProcessorType();

    let sType = this.m_oProcessorBasicInfo.get('oType').value;
    this.m_aoProcessorTypes.forEach(type => {
      if(type.id === sType) {
        sType = type.name
        this.m_oProcessorBasicInfo.controls['oType'].setValue(sType)
      }
    })
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

  setSelectedType(event: any) {
    this.m_aoProcessorTypes.forEach(oType => {
      if (oType.name === event.option.value) {
        this.m_oProcessorBasicInfo.patchValue({
          oType: oType.id
        })
      }
    });
  }

  onFileSelect(input: any) {
    if (input.files && input.files[0]) {
      this.m_sSelectedFileName = input.files[0].name;
      this.m_oSelectedFile = new FormData();
      this.m_oSelectedFile.append('file', input.files[0]);

      this.m_oProcessorBasicInfo.patchValue({
        oSelectedFile: this.m_oSelectedFile,
        sSelectedFileName: this.m_sSelectedFileName
      })
    }
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

  forceProcessorRefresh(sProcessorId: string) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProcessorId)) {
      return false;
    }

    this.m_oProcessorService.redeployProcessor(sProcessorId).subscribe({
      next: oResponse => {
        this.m_oNotificationService.openSnackBar("PROCESSOR REFRESH SCHEDULED", "Close", "right", "bottom");
      },
      error: oError => {
        this.m_oAlertDialog.openDialog(4000, "Error in Refreshing Processor")
      }

    })
    return true;
  }

  /**
   * Open Package Manager Dialog
   */
  openPackageManager() {
    let oDialog = this.m_oDialog.open(PackageManagerComponent, {
      height: '90vh',
      width: '90vw',
      data: {
        sProcessorId: this.m_sProcessorId,
        sProcessorName: this.m_sProcessorName
      }
    });
  }
}
