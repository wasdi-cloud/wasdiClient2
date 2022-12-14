import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ConstantsService } from 'src/app/services/constants.service';


export interface application { 
  buyed: boolean, 
  friendlyName: string, 
  imgLink: string, 
  isMine: boolean, 
  price: number, 
  processorDescription: string, 
  processorId: string, 
  processorName: string, 
  publisher: string, 
  score: number, 
  votes: number,
}
@Component({
  selector: 'app-app-details',
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.css']
})
export class AppDetailsComponent implements OnInit {
  sActiveApplicationName: string = this.oConstantsService.getSelectedApplication()
  sActiveApplicationInfo: any = {} as application;

  constructor(private oConstantsService: ConstantsService, private oProcessorService: ProcessorService, private oRouter: Router) { }

  ngOnInit(): void {
    if(this.sActiveApplicationName) {
      this.getApplicationDetails(this.sActiveApplicationName)
    }
  
  }

  //Get application details from server
  getApplicationDetails(applicationName: string) {
    return this.oProcessorService.getMarketplaceDetail(applicationName).subscribe(response => {
      this.sActiveApplicationInfo = response
    });
  }

  //Routing for back button
  marketplaceReturn(){
    this.oRouter.navigateByUrl('marketplace')
  }

  //Routing for opening AppUI page
  openAppUI(processorName: string) {
    this.oRouter.navigateByUrl(`${processorName}/appui`)
  }
}
