import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-list-box',
  templateUrl: './wap-list-box.component.html',
  styleUrls: ['./wap-list-box.component.css']
})
export class WapListBoxComponent {
  @Input() oListboxInput: any;
  @Output() oListboxInputChange = new EventEmitter<any>();

  getSelections(oEvent: any) {
    this.oListboxInput.aoSelected = oEvent.value;
    this.oListboxInputChange.emit(this.oListboxInput);
  }
}
