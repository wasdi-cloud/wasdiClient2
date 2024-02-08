import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  /**
 * The label for the button
 */
  @Input() m_sLabel: string = "";

  /**
   * The size of the button: small or large. Medium by default
   */
  @Input() m_sSize?: string = "";

  /**
   * Is the button disabled?
   */
  @Input() m_bDisabled?: boolean = false;

  /**
   * Is the button a link? 
   */
  @Input() m_bLink?: boolean = false;

  /**
   * Is the button rounded? 
   */
  @Input() m_bRounded?: boolean = false;

  /**
   * Is the button outlined instead of solid? 
   */
  @Input() m_bOutline?: boolean = false;

  /**
   * Id there an icon on the left side?
   */
  @Input() m_sIconLeft?: string = "";
  
   /**
   * Id there an icon on the right side?
   */
   @Input() m_sIconRight?: string = "";
}
