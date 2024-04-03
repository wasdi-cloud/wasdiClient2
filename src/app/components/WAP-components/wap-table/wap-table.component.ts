import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-wap-table',
  templateUrl: './wap-table.component.html',
  styleUrls: ['./wap-table.component.css']
})
export class WapTableComponent {
  @Input() m_aoTableInput: any;
  @Output() m_aoTableInputChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  emitTableInputs() {
    console.log("emitTableInputs");
    this.m_aoTableInputChange.emit(this.m_aoTableInput);
  }

  setTableInput(event, iRow, iColumn) {
    this.m_aoTableInput.aoTableVariables[iRow][iColumn] = event.target.value;
    console.log("Row " + iRow + " Col " + iColumn);
  }
}
