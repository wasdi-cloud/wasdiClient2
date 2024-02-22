import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-wap-numeric-box',
  templateUrl: './wap-numeric-box.component.html',
  styleUrls: ['./wap-numeric-box.component.css']
})
export class WapNumericBoxComponent implements OnInit {
  @Input() oNumericInfo: any;
  @Output() oNumericInfoChange = new EventEmitter<string>();

  ngOnInit(): void {
    console.log(this.oNumericInfo);
  }

  getUserInput(value: string) {
    // this.inputText = value; 
    // console.log(this.inputText)
    // this.inputTextChange.emit(this.inputText)
  }
}
