import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
  /**
   * The current progress bar percentage
   */
  @Input() m_iProgressPerc: number = 85;
}
