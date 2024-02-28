import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.css']
})
export class TextareaComponent {
  /**
     * Is the textarea disabled?
     */
  @Input() m_bIsDisabled: boolean = false;

  /**
   * Is the textarea readonly?
   */
  @Input() m_bIsReadonly: boolean = false;

  /**
   * Is the input of the form invalid? - Show helper text for invalid input.
   */
  @Input() m_bShowInvalid: boolean = false;

  /**
   * The input string - value of the textarea
   */
  @Input() m_sInputString?: string = ""

  /**
   * Is the input of the form valid (but something else was not)? - Show helper text for valid input
   */
  @Input() m_bShowValid: boolean = false;

  /**
   * Label
   */
  @Input() m_sLabel: string = "Label"

  /**
   * Helper text provided by invalid and valid inputs
   */
  @Input() m_sHelperText?: string = "Helper text"

  
}
