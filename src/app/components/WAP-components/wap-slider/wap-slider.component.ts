import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-wap-slider',
  templateUrl: './wap-slider.component.html',
  styleUrls: ['./wap-slider.component.css']
})
export class WapSliderComponent implements OnInit{
  @Input() m_oSliderInput: any;
  @Output() m_oSliderInputChange = new EventEmitter<any>();

  ngOnInit(): void {
  }

  getSelectionChange(oEvent) {
    this.m_oSliderInput.m_iValue = oEvent
    this.m_oSliderInputChange.emit(this.m_oSliderInput); 
  }
}
