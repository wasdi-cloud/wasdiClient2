import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-products-combo',
  templateUrl: './wap-products-combo.component.html',
  styleUrls: ['./wap-products-combo.component.css']
})
export class WapProductsComboComponent {
  @Input() m_aoProducts: string[];
  @Input() m_oControlSelection: any;
  @Output() m_oControlSelectionChange = new EventEmitter<any>();

  getUserInput(oEvent) {

    if (oEvent) {
      if (oEvent.value) {
        let sUserInput = oEvent.value.fileName;
        this.m_oControlSelection.sSelectedValues = sUserInput;
        this.m_oControlSelectionChange.emit(this.m_oControlSelection);    
      }
    }
  }
}
