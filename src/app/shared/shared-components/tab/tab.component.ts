import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent {

  /**
   * Is the tab active? 
   */
  @Input() m_bIsActive: boolean = false;

  /**
   * Is the tab disabled?
   */
  @Input() m_bIsDisabled: boolean = false;

  /**
   * Label for the Tab
   */
  @Input() m_sLabel: string = "Dashboard";

  /**
   * Tab size - Large or Default (medium)
   */
  @Input() m_sSize?: 'default' | 'large' | 'small' = 'default';

  @Input() m_bHasBorder?: boolean = true;
}
