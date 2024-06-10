import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-wap-date-time-picker',
  templateUrl: './wap-date-time-picker.component.html',
  styleUrls: ['./wap-date-time-picker.component.css']
})
export class WapDateTimePickerComponent implements OnInit {
  @Input() m_oDateControl
  @Output() m_oDateControlChange = new EventEmitter<any>();

  m_sInputDate: any;

  ngOnInit(): void {
    if (this.m_oDateControl.m_sDate) {
      var aoDateParts = this.m_oDateControl.m_sDate.split("/");      
      this.m_sInputDate = ""+aoDateParts[2]+"-"+ aoDateParts[1] + "-" +aoDateParts[0];
    }
  }

  /**
   * Event handler for date input
   * @param oEvent 
   */
  getDate(oEvent) {
    this.m_oDateControl.m_sDate = oEvent.event.target.value;
    this.m_oDateControlChange.emit(this.m_oDateControl)
  }
}
