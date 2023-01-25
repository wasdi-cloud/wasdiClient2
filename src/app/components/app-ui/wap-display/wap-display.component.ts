import { Component, Input, OnInit } from '@angular/core';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ViewElementFactory } from 'src/app/shared/factories/view-element.factory';

@Component({
  selector: 'app-wap-display',
  templateUrl: './wap-display.component.html',
  styleUrls: ['./wap-display.component.css']
})
export class WapDisplayComponent implements OnInit {
  @Input() wapData
  @Input() renderAsStrings

  m_aoViewElements: any[];

  constructor(private m_oProcessorService: ProcessorService) { }

  ngOnInit() {
    console.log(this.wapData);
    console.log(this.renderAsStrings)

    this.m_aoViewElements = this.generateViewElements(this.wapData)
    console.log(this.m_aoViewElements)
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
    let oFactory = new ViewElementFactory();
    let aoTabControls = oFactory.getTabElements(oFormToGenerate);
    //console.log(aoTabControls)
    return aoTabControls;
  }

  //add asMessages as param
  checkParams() {
    console.log("checking params")
    let bReturn: boolean = true;

    let asMessages: string[] = [];

    let sRequiredString: string = " is Required"

    for (let iControls = 0; iControls < this.m_aoViewElements.length; iControls++) {
      let oElement: any = this.m_aoViewElements[iControls];

      if (oElement.required) {
        if (this.renderAsStrings) {
          let sStringValue = oElement.getStringValue();
          console.log(sStringValue)
          if (!sStringValue) {
            let sMessage = oElement.label + sRequiredString;
            asMessages.push(sMessage);
          }
        } else {
          let oValue: any = oElement.getValue();


          if (oValue === null || oValue === undefined) {
            let sMessage = oElement.label + sRequiredString;
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
    console.log(bReturn)
    return bReturn
  }
  logOutput(event: any) {
    console.log(event)
  }
}

