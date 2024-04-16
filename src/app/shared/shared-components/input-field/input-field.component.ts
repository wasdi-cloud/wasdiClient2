import { outputAst } from '@angular/compiler';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.css']
})
export class InputFieldComponent {
  /**
    * Is the Input Field Valid?
    */
  @Input() m_bIsValid: boolean = true;

  /**
   * Is the Input Field Disabled? 
   */
  @Input() m_bIsDisabled: boolean = false;

  /**
   * Is the Input Field Readonly?
   */
  @Input() m_bIsReadonly: boolean = false;

  /**
   * The label to appear *above* the input field
   */
  @Input() m_sLabel: string = ""

  /**
   * The placeholder text to appear inside the input field
   */
  @Input() m_sPlacehodler: string = "";

  /**
   * Input field Type. Default is text input
   */
  @Input() m_sInputType: string = "text";

  /**
   * The input name
   */
  @Input() m_sInputName: string = ""

  /**
   * String text for Icon appearing on the left. If null, there is no icon
   */
  @Input() m_sIconLeft: string | null = null;

  /**
 * String text for Icon appearing on the Right. If null, there is no icon
 */
  @Input() m_sIconRight: string | null = null;

  /**
   * Optional Pattern input
   */
  @Input() m_sPattern?: string = "";

  /**
   * Optional Input Value
   */
  @Input() m_sInputValue?: string = "";

  /**
   * Optional Input for Maximum Value (Numeric Inputs)
   */
  @Input() m_sMaxValue?: any = "";

  /**
   * Optional Input for Minimum Value (Numeric Inputs)
   */
  @Input() m_sMinValue?: any = "";

  @Input() m_bClearField?: boolean = false;

  /**
   * Is the input field required?
   */
  @Input() m_bIsRequired?: boolean = false;

  /**
   * Event Emitter the input change to listening parent
   */
  @Output() m_oInputChange: EventEmitter<any> = new EventEmitter();

  @Output() m_oClearInput: EventEmitter<any> = new EventEmitter();

  /**
   * Emit the changes to the input to listening parent component
   * @param oEvent
   */

  emitInputChange(oEvent) {
    if (this.m_sInputType) {

      let aoEmit = {
        label: this.m_sLabel,
        event: oEvent
      }

      this.m_oInputChange.emit(aoEmit)
    } else {
      this.m_oInputChange.emit(oEvent)
    }
  }

  emitClearInput(oEvent) {
    this.m_oClearInput.emit(true)
  }
}
