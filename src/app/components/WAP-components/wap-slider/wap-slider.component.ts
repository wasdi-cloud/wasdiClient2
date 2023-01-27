import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-wap-slider',
  templateUrl: './wap-slider.component.html',
  styleUrls: ['./wap-slider.component.css']
})
export class WapSliderComponent {
  @Input() oSliderInput: any;
  @Output() oSliderInputChange = new EventEmitter<any>();

  formatLabel(iValue: number): string {
    if (iValue >= 1000) {
      return Math.round(iValue / 1000) + 'k';
    }
    return `${iValue}`;
  }

  getSliderInput(oEvent: any) {
    this.oSliderInput.m_iValue = oEvent.srcElement.value;

    this.oSliderInputChange.emit(this.oSliderInput); 
  }
}
