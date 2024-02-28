import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-wap-date-time-picker',
  templateUrl: './wap-date-time-picker.component.html',
  styleUrls: ['./wap-date-time-picker.component.css']
})
export class WapDateTimePickerComponent implements OnInit {
  @Input() m_oDateControl
  @Output() m_oDateControlChange = new EventEmitter<any>();

  m_sInputDate: string;

  ngOnInit(): void {
    if (this.m_oDateControl.m_sDate) {
      this.m_sInputDate = this.m_oDateControl.m_sDate;
    }
  }

  /**
   * Event handler for date input
   * @param oEvent 
   */
  getDate(oEvent) {
    this.m_oDateControl.m_sDate = new Date(oEvent.event.target.value);
    this.m_oDateControlChange.emit(this.m_oDateControl)
  }
}
