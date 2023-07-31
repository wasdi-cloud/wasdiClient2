import { Component, Input, OnInit } from '@angular/core';

//Service Imports:
import { ConstantsService } from 'src/app/services/constants.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

//Model Imports:
import { Workspace } from 'src/app/shared/models/workspace.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { FormGroup } from '@angular/forms';

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
    * User Uploaded Zip file
    */
  m_oFile: any = null;

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
  m_sProcessorId: string = "";

  /**
   * Selected File
   */
  m_oSelectedFile: any = null;

  @Input() m_oProcessorBasicInfo: FormGroup; 

  m_aoProcessorTypes = [
    { name: "Python 3.7 Pip", id: "ubuntu_python37_snap" },
    // { name: "Python 3.x Pip 2", id: "python_pip_2" },
    // { name: "Python 3.x Pip One Shot", id: "pip_oneshot" },
    { name: "IDL 3.7.2", id: "ubuntu_idl372" },
    { name: "OCTAVE 6.x", id: "octave" },
    { name: "Python 3.x Conda", id: "conda" },
    { name: "C# .NET Core", id: "csharp" },
    { name: "OGC Application Package", id: "eoepca" }
  ];

  m_aoProcessorTypesMap = this.m_aoProcessorTypes.map(oProcessorType => {
    return oProcessorType.name;
  })

  /**
  * View Model with the Processor Detailed Info.
  * Is fetched and saved with different APIs
  * @type {{processorDescription: string, updateDate: number, images: [], imgLink: string, ondemandPrice: number, link: string, score: number, processorId: string, publisher: string, buyed: boolean, processorName: string, categories: [], isMine: boolean, friendlyName: string, email: string, subscriptionPrice: number}}
  */
  m_oProcessorDetails = {
    processorId: "",
    processorName: "",
    processorDescription: "",
    imgLink: "",
    publisher: "",
    score: 0.0,
    friendlyName: "",
    link: "",
    email: "",
    ondemandPrice: 0.0,
    subscriptionPrice: 0.0,
    updateDate: 0,
    categories: [],
    images: [],
    isMine: true,
    buyed: false,
    longDescription: "",
    showInStore: false,
    maxImages: 6,
    reviewsCount: 0,
    purchased: 0, // NOTE: at the moment here is the count of run on the main server
    totalRuns: 0, // NOTE: not set at the moment
    userRuns: 0, // NOTE: not set at the moment
  };

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oProductService: ProductService,
    private m_oWorkspaceService: WorkspaceService) {
  }

  ngOnInit(): void {
    //Set the active workspace from the constants service
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();

    console.log(this.m_oProcessorBasicInfo)
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

  /**
   * Utility method to Create a NEW processor
   * @param oController
   * @param oSelectedFile
   * @returns {boolean}
   */
  // postProcessor(oController: any, oSelectedFile: any) {
  //   if (!oSelectedFile) {
  //     return false;
  //   }

  //   let sType = this.m_oSelectedType.id;
  //   let sPublic = "1";
  //   if (this.m_bIsPublic === false) {
  //     sPublic = "0";
  //   }

  //   let oBody = new FormData();
  //   oBody.append('file', this.m_oFile[0]);

  //   if (sType === "ubuntu_python_snap" || sType === "ubuntu_python37_snap") {
  //     this.m_sName = this.m_sName.toLowerCase();
  //   }

  //   let sName = encodeURIComponent(this.m_sName);
  //   let sDescription = encodeURIComponent(this.m_sDescription);

  //   this.m_oProcessorService.uploadProcessor(this.m_oActiveWorkspace.workspaceId, sName, this.m_sVersion, sDescription, sType, this.m_sJSONSample, sPublic, oBody).subscribe(oResponse => {
  //     console.log(oResponse);
  //   })

  //   return true;
  // }


  /**
   * Update an existing processor
   */
  deployProcessor() {
    if (!this.m_oSelectedFile) {
      return false;
    }

    let sType: string = this.m_oSelectedType.id;

    let sIsPublic = "1";
    if (this.m_bIsPublic === false) {
      sIsPublic = "0";
    }

    // let oBody = new FormData();
    // oBody.append("file", this.m_oSelectedFile);

    if (sType === "ubuntu_python_snap" || sType === "ubuntu_python37_snap") {
      this.m_sName = this.m_sName.toLowerCase();
    }

    let sName = encodeURIComponent(this.m_sName);
    let sDescription = encodeURIComponent(this.m_sDescription);

    console.log(sName);
    console.log(sDescription);
    console.log(this.m_oSelectedFile);
    console.log(this.m_oActiveWorkspace.workspaceId)

    this.m_oProcessorService.uploadProcessor(this.m_oActiveWorkspace.workspaceId, sName, this.m_sVersion, sDescription, sType, this.m_sJSONSample, sIsPublic, this.m_oSelectedFile).subscribe({
      next: oResponse => {
        console.log(oResponse);
        let sMessage: string;
        if (oResponse.boolValue === true) {
          sMessage = "Processor Uploaded - it will be deployed shortly";
        } else {
          sMessage = "Error uploading processor";

          if (!oResponse.stringValue) {
            sMessage = `Error Code: ${oResponse.intValue}`;
          } else {
            sMessage += oResponse.stringValue;
          }
          //ADD ALERT NOTIFICATION
          console.log(sMessage);
        }
      },
      error: oError => {
        //ADD ERROR NOTIFICATION 
        console.log("There was an error in deploying the processor");
      }
    })

    //Is there also a new file to upload? 
    if(FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oSelectedFile) === false) {
      
    }
    return true;
  }

  setSelectedType(event: any) {
    this.m_aoProcessorTypes.forEach(oType => {
      if (oType.name === event.option.value) {
        this.m_oSelectedType = oType;
      }
    });
    console.log(this.m_oSelectedType);
  }

  onFileSelect(input: any) {
    if (input.files && input.files[0]) {
      this.m_oSelectedFile = new FormData();
      this.m_oSelectedFile.append('file', input.files[0]);
    }
  }
}
