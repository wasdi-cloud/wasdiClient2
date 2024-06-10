import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-textbox',
  templateUrl: './wap-textbox.component.html',
  styleUrls: ['./wap-textbox.component.css']
})
export class WapTextboxComponent {
  /**
  * Local Copy of the Text
  */
  m_oLocalTextboxInfo: any;
  
  /**
  * Original reference to the object of the parent view
  */
  m_oOriginalTextInfo: any;
  
  /**
  * Getter of the Numeric Info: we return the local copy
  */
  @Input() 
  public get m_oTextboxInfo(): any {
    return this.m_oLocalTextboxInfo;
  }
  
  /**
  * Setter of the Text Info: we make a copy in the local one and keep the refernce to the original one
  */
  public set m_oTextboxInfo(oTextInfo) {
    this.m_oLocalTextboxInfo = JSON.parse(JSON.stringify(oTextInfo));
    this.m_oOriginalTextInfo = oTextInfo;
  }
  
  @Output() m_oTextboxInfoChange = new EventEmitter<any>(); 

  getUserInput(oEvent: any) {
    this.m_oOriginalTextInfo.m_sText = oEvent.target.value
    this.m_oTextboxInfoChange.emit(this.m_oOriginalTextInfo);
  }
}
