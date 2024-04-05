import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-numeric-box',
  templateUrl: './wap-numeric-box.component.html',
  styleUrls: ['./wap-numeric-box.component.css']
})
export class WapNumericBoxComponent {

  m_oLocalNumericInfo: any;
  m_oOriginalNumericInfo: any;

  @Input() 
  public get m_oNumericInfo(): any {
    return this.m_oLocalNumericInfo;
  }

  public set m_oNumericInfo(oNumericInfo) {
    this.m_oLocalNumericInfo =  JSON.parse(JSON.stringify(oNumericInfo));
    this.m_oOriginalNumericInfo = oNumericInfo;
  }  

  @Output() m_oNumericInfoChange = new EventEmitter<string>();

  getUserInput(oEmitFromInputEvent: any) {

    let sValue = this.m_oLocalNumericInfo.m_sText;

    if (oEmitFromInputEvent.event) {
      if (oEmitFromInputEvent.event.srcElement) {
        sValue = oEmitFromInputEvent.event.srcElement.value;
      }
    }
    this.m_oLocalNumericInfo.m_sText = sValue;
    this.m_oOriginalNumericInfo.m_sText = sValue;
    this.m_oNumericInfoChange.emit(this.m_oOriginalNumericInfo);
  }
}
