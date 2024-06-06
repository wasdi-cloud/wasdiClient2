import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent implements OnChanges {
  @Input() m_aoInputs

  @Input() m_sPlaceholder: string = "";

  @Input() m_sLabel?: string = "";

  @Input() m_oController: any;

  @Input() m_oDeleteFn?: (args: any, controller: any) => void;

  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  m_sSearchString: string = "";

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    // this.m_sSearchString = "";
  }

  getOptionText(oOption) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oOption)) {
      return "";
    }

    if (oOption.workspaceName) {
      return oOption.workspaceName
    } else {
      return oOption.name
    }
  }

  emitSelectionChange(oEvent) {
    this.m_oSelectionChange.emit(oEvent.option.value);
  }
}
