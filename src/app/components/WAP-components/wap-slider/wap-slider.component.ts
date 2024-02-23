import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-wap-slider',
  templateUrl: './wap-slider.component.html',
  styleUrls: ['./wap-slider.component.css']
})
export class WapSliderComponent implements OnInit{
  @Input() oSliderInput: any;
  @Output() oSliderInputChange = new EventEmitter<any>();

  ngOnInit(): void {
      console.log(this.oSliderInput)
  }

  getSelectionChange(oEvent) {
    this.oSliderInput.m_iValue = oEvent
    this.oSliderInputChange.emit(this.oSliderInput); 
  }
}
