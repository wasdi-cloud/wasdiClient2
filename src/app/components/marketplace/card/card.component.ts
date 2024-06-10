import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConstantsService } from 'src/app/services/constants.service';

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

  constructor(
    private m_oConstantsService: ConstantsService, 
    private m_oRouter: Router
  ) { }

  openProcessorDetails(sProcessorName: string) {
    this.m_oConstantsService.setSelectedApplication(sProcessorName)
    this.m_oRouter.navigateByUrl(`${sProcessorName}/appDetails`)
  }
}
