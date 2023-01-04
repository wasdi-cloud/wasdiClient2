import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-marketplace-app-card',
  templateUrl: './marketplace-app-card.component.html',
  styleUrls: ['./marketplace-app-card.component.css']
})
export class MarketplaceAppCardComponent {
  @Input() processor!: any

  constructor(private oRouter: Router, private oConstantsService: ConstantsService) {}

  openProcessorDetails(processorName: string) {
    this.oConstantsService.setSelectedApplication(processorName)
    this.oRouter.navigateByUrl(`${processorName}/appDetails`)
  }
}
