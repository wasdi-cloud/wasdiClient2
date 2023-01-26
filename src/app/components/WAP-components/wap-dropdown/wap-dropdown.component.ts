import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-wap-dropdown',
  templateUrl: './wap-dropdown.component.html',
  styleUrls: ['./wap-dropdown.component.css']
})
export class WapDropdownComponent implements OnInit {
  @Input() oControlInfo: any;
  @Input() inputOptions: any[];
  @Output() oControlInfoChange = new EventEmitter<any>()
  control = new FormControl('');
  filteredOptions: Observable<string[]>;

  inputNames: string[];

  ngOnInit() {
    console.log(this.oControlInfo)
    this.inputNames = this.oControlInfo.asListValues.map(option => {
      return option.name
    })
    this.control.setValue(this.oControlInfo.sSelectedValues.name)
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

  }
  private _filter(value: any) {
    const filterValue = value.toLowerCase();

    return this.inputNames.filter(option => option.toLowerCase().includes(filterValue));
  }

  getSelectedOption(event: any) {
    console.log(event.option.value)
    this.oControlInfo.oSelectedValue.name = event.option.value

    console.log(this.oControlInfo)
    this.oControlInfoChange.emit(this.oControlInfo)
  }
}
