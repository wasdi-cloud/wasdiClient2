import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-date-time-picker',
  templateUrl: './wap-date-time-picker.component.html',
  styleUrls: ['./wap-date-time-picker.component.css']
})
export class WapDateTimePickerComponent {
  @Input() inputtedDate: string; 
  @Output() inputtedDateChange = new EventEmitter<any>();

  getDate(event) {
    console.log(event.value)
    this.inputtedDate = event.value; 

    this.inputtedDateChange.emit(this.inputtedDate); 
  }
}
