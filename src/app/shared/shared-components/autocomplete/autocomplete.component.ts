import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent {
  /**
   * Array of inputs to be displayed in selection dropdown
   */
  @Input() m_aoInputs

  /**
   * Placeholder string for input field
   */
  @Input() m_sPlaceholder: string = "";

  /**
   * Label String
   */
  @Input() m_sLabel?: string = "";

  /**
   * Controller where Delete fn occurs
   */
  @Input() m_oController: any;

  /**
   * Delete fn passed from parent component
   */
  @Input() m_oDeleteFn?: (args: any, controller: any) => void;

  /**
   * Will the input field output the search string text?
   */
  @Input() m_bEmitOutput?: boolean = false;

  /**
   * Event emitter for changes to the dropdown selection
   */
  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Event emitter for changes to the search string text
   */
  @Output() m_oTextChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Search string - model for the input field
   */
  m_sSearchString: string = "";

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) { }

  /**
   * Get the display string for each element of the dropdown
   * @param oOption 
   * @returns string
   */
  getOptionText(oOption): string {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oOption)) {
      return "";
    }
    if (oOption.workspaceName) {
      return oOption.workspaceName
    } else {
      return oOption.name
    }
  }

  /**
   * Emit changes to the selected element
   * @param oEvent 
   */
  emitSelectionChange(oEvent): void {
    this.m_oSelectionChange.emit(oEvent.option.value);
  }

  /**
   * Emit changes to the search string text
   * @param oEvent 
   */
  emitTextChanges(oEvent): void {
    this.m_oTextChange.emit(this.m_sSearchString);
  }
}
