import { Component } from '@angular/core';

@Component({
  selector: 'app-wap-slider',
  templateUrl: './wap-slider.component.html',
  styleUrls: ['./wap-slider.component.css']
})
export class WapSliderComponent {
  formatLabel(iValue: number): string {
    if (iValue >= 1000) {
      return Math.round(iValue / 1000) + 'k';
    }

    return `${iValue}`;
  }
}
