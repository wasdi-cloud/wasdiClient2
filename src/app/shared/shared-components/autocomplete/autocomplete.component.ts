import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements OnChanges {
  @Input() m_aoInputs

  @Input() m_sPlaceholder: string = "";

  @Input() m_oController: any;

  @Input() m_oDeleteFn?: (args: any, controller: any) => void;

  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  m_asInputsMap: Array<string> = [];

  m_sSearchString: string = "";

  ngOnChanges(changes: SimpleChanges): void {
    this.getStringNames()
  }

  getStringNames() {
    this.m_asInputsMap = this.m_aoInputs.map(oElement => {
      if (oElement.workspaceName) {
        return oElement.workspaceName;
      }
    })
  }

  getOptionText(option) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(option)) {
      return "";
    }
    return option.workspaceName
  }

  emitSelectionChange(oEvent) {
    console.log(oEvent.option.value)
    this.m_oSelectionChange.emit(oEvent.option.value);
  }
}
