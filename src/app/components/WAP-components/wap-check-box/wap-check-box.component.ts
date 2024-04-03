import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-check-box',
  templateUrl: './wap-check-box.component.html',
  styleUrls: ['./wap-check-box.component.css']
})
export class WapCheckBoxComponent {
  @Input() m_oCheckboxDetails: any;
  @Output() m_oCheckboxDetailsChange = new EventEmitter<any>(); 

  getOutput(oEvent) {
    this.m_oCheckboxDetails.m_bValue = oEvent.target.checked
    this.m_oCheckboxDetailsChange.emit(this.m_oCheckboxDetails); 
  }
}
