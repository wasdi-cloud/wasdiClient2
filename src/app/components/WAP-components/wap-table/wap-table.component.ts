import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-wap-table',
  templateUrl: './wap-table.component.html',
  styleUrls: ['./wap-table.component.css']
})
export class WapTableComponent {
  @Input() m_aoTableInput: any;
  @Output() m_aoTableInputChange = new EventEmitter<any>();

   m_aoLocalInputsCopy: any[][];

  constructor() { }


  ngOnInit() {
    this.m_aoLocalInputsCopy = JSON.parse(JSON.stringify(this.m_aoTableInput.aoTableVariables));
  }

  setTableInput(event, iParentIndex, iChildIndex) {
    this.m_aoLocalInputsCopy[iParentIndex][iChildIndex] = event.target.value;
    this.m_aoTableInput.aoTableVariables = JSON.parse(JSON.stringify(this.m_aoLocalInputsCopy));     
  }
}
