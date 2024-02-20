import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent {
  /**
   * The input array: 
   */
  @Input() m_aoDropdownItems: Array<any> = [];

  /**
   * Is there a default option - add input? (i.e., pre-selected array)
   */
  @Input() m_aoSelectedItems: Array<any> = [];

  /**
   * Is the dropdown a multi-select dropdown? Default: false;
   */
  @Input() m_bIsMultiSelect: boolean = false;

  /**
   * Is the input list searchable? Default: false;
   */
  @Input() m_bHasSearch: boolean = false;

  /**
   * An optional placeholder text
   */
  @Input() m_sPlaceholder?: string = "";

  /**
   * Emit the selection to listening parent
   */
  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter()

  /**
   * Emit selection change to listening parent component
   */
  emitSelectionChange(oEvent) {
    console.log(this.m_aoSelectedItems)
    this.m_oSelectionChange.emit(oEvent);
  }

  getValues(oValues) {
    let aoNewValues = [];
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oValues) === false) {
      if (this.m_bIsMultiSelect === true) {
        oValues.forEach(oElement => {
          if (oElement.name) {
            aoNewValues.push(oElement.name)
          }
        });
      } else {
        aoNewValues = oValues.name ? oValues.name : oValues.workspaceName;
      }
    }
    return aoNewValues;
  }
  
  deleteFn() {
    console.log("delete")
  }
}
