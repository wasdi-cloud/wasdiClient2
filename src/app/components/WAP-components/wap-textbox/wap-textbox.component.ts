import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-textbox',
  templateUrl: './wap-textbox.component.html',
  styleUrls: ['./wap-textbox.component.css']
})
export class WapTextboxComponent {
  @Input() oTextboxInfo; 
  @Output() oTextboxInfoChange = new EventEmitter<any>(); 

  getUserInput(oEvent: any) {
    console.log(oEvent.target.value)
    this.oTextboxInfo.m_sText = oEvent.target.value
  }
}
