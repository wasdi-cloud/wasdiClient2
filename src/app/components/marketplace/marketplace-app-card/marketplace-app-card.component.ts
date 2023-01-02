import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marketplace-app-card',
  templateUrl: './marketplace-app-card.component.html',
  styleUrls: ['./marketplace-app-card.component.css']
})
export class MarketplaceAppCardComponent {
  @Input() processor!: any

  constructor() {}
}
