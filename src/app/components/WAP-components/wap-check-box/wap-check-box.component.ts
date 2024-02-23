import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-check-box',
  templateUrl: './wap-check-box.component.html',
  styleUrls: ['./wap-check-box.component.css']
})
export class WapCheckBoxComponent {
  @Input() oCheckboxDetails: any;
  @Output() oCheckboxDetailsChange = new EventEmitter<any>(); 

  getOutput(oEvent) {
    this.oCheckboxDetails.m_bValue = oEvent.target.checked
    this.oCheckboxDetailsChange.emit(this.oCheckboxDetails); 
  }
}
