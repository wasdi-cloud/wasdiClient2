import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-marketplace-app-card',
  templateUrl: './marketplace-app-card.component.html',
  styleUrls: ['./marketplace-app-card.component.css']
})
export class MarketplaceAppCardComponent {
  @Input() oProcessor!: any;

  faStar = faStar;
  faStarHalf = faStarHalf;

  constructor(private oRouter: Router, private oConstantsService: ConstantsService) {

  }

  openProcessorDetails(sProcessorName: string) {
    this.oConstantsService.setSelectedApplication(sProcessorName)
    this.oRouter.navigateByUrl(`${sProcessorName}/appDetails`)
  }

  getPrice(iPrice: number): string {
    if (iPrice === 0) {
      return "Free";
    } else {
      return `${iPrice}`
    }

  }
}