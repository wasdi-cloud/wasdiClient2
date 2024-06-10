import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-numeric-box',
  templateUrl: './wap-numeric-box.component.html',
  styleUrls: ['./wap-numeric-box.component.css']
})
export class WapNumericBoxComponent {
  /**
   * Local Copy of the Numeric Info
   */
  m_oLocalNumericInfo: any;

  /**
   * Original reference to the object of the parent view
   */
  m_oOriginalNumericInfo: any;

  /**
   * Getter of the Numeric Info: we return the local copy
   */
  @Input() 
  public get m_oNumericInfo(): any {
    return this.m_oLocalNumericInfo;
  }

  /**
   * Setter of the Numeric Info: we make a copy in the local one and keep the refernce to the original one
   */
  public set m_oNumericInfo(oNumericInfo) {
    this.m_oLocalNumericInfo =  JSON.parse(JSON.stringify(oNumericInfo));
    this.m_oOriginalNumericInfo = oNumericInfo;
  }  

  /**
   * Event to notify the change of the Numeric Info
   */
  @Output() m_oNumericInfoChange = new EventEmitter<string>();

  /**
   * Received when the number changes.
   * We take the value in the local copy, valorize it in the parent object and emit it.
   * 
   * @param oEmitFromInputEvent 
   */
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
