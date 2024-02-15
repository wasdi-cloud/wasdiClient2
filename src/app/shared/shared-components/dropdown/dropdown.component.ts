import { Component, EventEmitter, Input, Output } from '@angular/core';

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
    this.m_oSelectionChange.emit(oEvent);
  }
}
