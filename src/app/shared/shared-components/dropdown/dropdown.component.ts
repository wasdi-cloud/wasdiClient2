import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit{
  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oWorkspaceService: WorkspaceService
  ){}
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

  @Input() m_oController?: any;

  @Input() m_oDeleteFn?: (args: any, controller: any) => void;

  /**
   * Emit the selection to listening parent
   */
  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter()

  /**
   * Emit selection change to listening parent component
   */
  emitSelectionChange(oEvent) {
    this.m_oSelectionChange.emit(oEvent);
  }

  ngOnInit(): void {
      console.log(this.m_aoDropdownItems)
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
  
}
