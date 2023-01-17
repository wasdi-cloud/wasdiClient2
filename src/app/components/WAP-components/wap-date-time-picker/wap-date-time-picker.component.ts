import { Component, Output } from '@angular/core';

@Component({
  selector: 'app-wap-date-time-picker',
  templateUrl: './wap-date-time-picker.component.html',
  styleUrls: ['./wap-date-time-picker.component.css']
})
export class WapDateTimePickerComponent {
 @Output() inputtedDate: any; 

 getDate(event) {
  console.log(event.target.value)
 }
}
