import { Component, Input, OnInit } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProductService } from 'src/app/services/api/product.service';
import { ViewElementFactory } from 'src/app/shared/wap-components/view-element.factory';

@Component({
  selector: 'app-wap-display',
  templateUrl: './wap-display.component.html',
  styleUrls: ['./wap-display.component.css']
})
export class WapDisplayComponent implements OnInit {

  /**
   * List of controls to show in this tab
   */
  @Input() wapData

  /**
   * Flag to know if the inputs must be rendered as native values or all as strings
   */
  @Input() renderAsStrings

  /**
   * Id of the active workspace
   */
  @Input() workspaceId

  /**
   * List of the view elements to show. Should be one for each control 
   * in the wapData Array => One element for each parameter of the app
   */
  m_aoViewElements: any[];

  /**
   * Array of the product View Models in the selected workpsace
   */
  m_aoProductsArray: any[] = [];

  /**
   * Array of the names of the products in the selected workspace
   */
  m_asProductNames: string[];

  constructor(private m_oProcessorService: ProcessorService, private m_oProductService: ProductService) { }

  ngOnInit() {
    // We generate the view elements starting from the wapData 
    this.m_aoViewElements = this.generateViewElements(this.wapData)
  }

  /**
   * We refresh the list of products in the workspace
   */
  ngOnChanges() {
    this.getWorkspaceProducts();
  }

  /**
     * Get the list of controls in a Tab
     * @param sTabName Name of the tab
     * @returns {*}
     */
  getTabControls() {
    return this.m_aoViewElements;
  }
  /**
  * Generates the view elements of the Processor
  * @param oFormToGenerate JSON Object representing the Processor UI
  * @returns {[]} an object with a property for each tab. Each property is an array of the controls of the tab
  */
  generateViewElements(oFormToGenerate) {
    let aoTabControls = ViewElementFactory.getTabElements(oFormToGenerate);
    return aoTabControls;
  }

  //add asMessages as param
  checkParams(asMessages: string[]) {
    let bReturn: boolean = true;

    for (let iControls = 0; iControls < this.m_aoViewElements.length; iControls++) {
      let oElement: any = this.m_aoViewElements[iControls];

      if (oElement.required) {
        if (this.renderAsStrings) {
          let sStringValue = oElement.getStringValue();
          if(oElement.sSelectedValues) {
            sStringValue = oElement.sSelectedValues.name;
          }
          if (!sStringValue) {
            let sMessage = oElement.label + ": Missing required field";
            asMessages.push(sMessage);
            bReturn = false
          }
        } else {
          let oValue: any = oElement.getValue();
          if (oValue === null || oValue === undefined || oValue === "")  {
            let sMessage = oElement.label + ": Missing required field";
            asMessages.push(sMessage);

            bReturn = false;
          }
        }
      }

      if (typeof oElement.isValid === "function") {
        if (!oElement.isValid(asMessages)) {
          bReturn = false
        }
      }      
    }
    return bReturn
  }

  /**
   * Get products for workspace and pass to ProductsCombo child
   */
  getWorkspaceProducts(): any {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.workspaceId)) {
      return [];
    } else {
      this.m_oProductService.getProductListByWorkspace(this.workspaceId).subscribe(oResponse => {
        this.m_aoProductsArray = oResponse

        return this.m_asProductNames = this.m_aoProductsArray.map(element => {
          return element.name
        });
      })
    }
  }

  createParams() {
    let oProcessorInput = {};
    for (let iControls = 0; iControls < this.m_aoViewElements.length; iControls++) {
      let oElement = this.m_aoViewElements[iControls];
      //Save the value to the output JSON 
      if (this.renderAsStrings && oElement.type !== 'numeric') {
        oProcessorInput[oElement.paramName] = oElement.getStringValue()
      } else {
        oProcessorInput[oElement.paramName] = oElement.getValue();
      }
    }
    return oProcessorInput;
  }

  /**
   * Temporary Function to track WAP components 
   * @param event 
   */
  logOutput(event: any) {
    console.log(event)
  }
}

