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

  m_aoViewElements: any[];

  constructor(private m_oProcessorService: ProcessorService) { }

  ngOnInit() {
    console.log(this.wapData);

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
}
