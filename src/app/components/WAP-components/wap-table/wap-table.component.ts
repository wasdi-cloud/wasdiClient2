import { registerLocaleData } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-wap-table',
  templateUrl: './wap-table.component.html',
  styleUrls: ['./wap-table.component.css']
})
export class WapTableComponent {
  @Input() oTableInput: any;
  @Output() oTableInputChange = new EventEmitter<any>();

  m_asUserInputs: any[] = [];

  aoInputs: any[];

  constructor(private oFormBuilder: FormBuilder) { }


  ngOnInit() {
    this.m_asUserInputs = this.oTableInput.aoTableVariables;
    // console.log(this.m_asUserInputs);
    this.aoInputs = []
    for (let index = 0; index < this.oTableInput.aoTableVariables.length; index++) {
      this.aoInputs.push([])
      for (let j = 0; j < this.oTableInput.aoTableVariables[1].length; j++) {
        this.aoInputs[index].push(undefined)
      }
    }
  }

  emitTableInputs() {
    // console.log(event.target.value);
    console.log(this.aoInputs);
    this.oTableInput.aoTableVariables = this.aoInputs; 

    console.log(this.oTableInput.aoTableVariables)
    this.oTableInputChange.emit(this.oTableInput);
  }

  getTableInput(event, iParentIndex, iChildIndex) {
    console.log(this.m_asUserInputs);
    console.log(event)
    console.log(event.target.value)

    this.aoInputs[iParentIndex][iChildIndex] = event.target.value;
  }
}
