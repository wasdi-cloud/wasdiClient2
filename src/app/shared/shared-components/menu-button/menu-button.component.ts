import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.css']
})
export class MenuButtonComponent {
  /**
   * Is the menu item active?
   */
  @Input() m_bIsActive: boolean = false;

  /**
   * What is the icon for the menu item?
   */
  @Input() m_sIcon: string = "";

  /**
   * What is the label for the menu item? 
   */
  @Input() m_sLabel: string = "";
}
