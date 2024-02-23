import { Component, EventEmitter, Input,Output } from '@angular/core';

@Component({
  selector: 'app-wap-dropdown',
  templateUrl: './wap-dropdown.component.html',
  styleUrls: ['./wap-dropdown.component.css']
})
export class WapDropdownComponent {
  @Input() oControlInfo: any;
  @Output() oControlInfoChange = new EventEmitter<any>()

  getSelectedOption(event: any) {
    this.oControlInfo.oSelectedValue.name = event.value.name
    this.oControlInfoChange.emit(this.oControlInfo)
  }
}
