import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  /**
   * The input object of the processor. 
   */
  @Input() m_oProcessor: any = {}

  ngOnInit(): void {
      console.log(this.m_oProcessor)
  }
}
