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
  @Input() wapData
  @Input() renderAsStrings
  @Input() workspaceId

  m_aoViewElements: any[];

  m_aoProductsArray: any[] = [];
  m_asProductNames: string[];

  constructor(private m_oProcessorService: ProcessorService, private m_oProductService: ProductService) { }

  ngOnInit() {
    this.m_aoViewElements = this.generateViewElements(this.wapData)
  }

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
            let sMessage = oElement.label;
            asMessages.push(sMessage);
            bReturn = false
          }
        } else {
          let oValue: any = oElement.getValue();
          if (oValue === null || oValue === undefined) {
            let sMessage = oElement.label;
            asMessages.push(sMessage);

            bReturn = false;
          }
        }
        if (typeof oElement.isValid === "function") {
          if (!oElement.isValid(asMessages)) {
            bReturn = false
          }
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

