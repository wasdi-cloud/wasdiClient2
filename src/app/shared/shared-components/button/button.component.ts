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
   * Is there an icon on the left side?
   */
  @Input() m_sIconLeft?: string = "";

  /**
  * Is there an icon on the right side?
  */
  @Input() m_sIconRight?: string = "";

  /**
   * Is the button "muted" (i.e., "white")?
   */
  @Input() m_bMuted?: boolean = false;

  /**
   * Is the button a delete button (i.e., should it be RED)? 
   */
  @Input() m_bIsDelete?: boolean = false;

  /**
   * Is the background of the button a solid white?
   */
  @Input() m_bIsBgSolid?: boolean = false;

  /**
   * Is there are text colour override - to white? 
   */
  @Input() m_bTextWhite?: boolean = false;
}
