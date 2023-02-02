import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wap-numeric-box',
  templateUrl: './wap-numeric-box.component.html',
  styleUrls: ['./wap-numeric-box.component.css']
})
export class WapNumericBoxComponent {
  @Input() inputText!: string; 
  @Output()inputTextChange = new EventEmitter<string>(); 

  getUserInput(value: string) {
    this.inputText = value; 
    console.log(this.inputText)
    this.inputTextChange.emit(this.inputText)
  }
}
