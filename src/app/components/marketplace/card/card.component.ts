import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  /**
   * The input object of the processor. 
   */
  @Input() m_oProcessor: any = {}
}
