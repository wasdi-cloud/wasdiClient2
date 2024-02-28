import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-numeric-box',
  templateUrl: './wap-numeric-box.component.html',
  styleUrls: ['./wap-numeric-box.component.css']
})
export class WapNumericBoxComponent {
  @Input() oNumericInfo: any;
  @Output() oNumericInfoChange = new EventEmitter<string>();

  getUserInput(value: string) {
    this.oNumericInfo.m_sText = value;
    this.oNumericInfoChange.emit(this.oNumericInfo);
  }
}
