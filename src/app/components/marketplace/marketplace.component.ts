import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { ProcessorService } from 'src/app/services/api/processor.service';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog"
 
@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css']
})
export class MarketplaceComponent implements OnInit {
  m_oAppFilter = {
    categories: [],
    publishers: [],
    name: "",
    score: 0,
    minPrice: -1,
    maxPrice: 1000,
    itemsPerPage: 12,
    page: 0,
    orderBy: "name",
    orderDirection: 1
  }

  m_aoApplications: {
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
  }[] = [];

  constructor(private oProcessorService: ProcessorService, private dialog: MatDialog) {}

  ngOnInit(): void {
      this.oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe(response => {
        console.log(response)
      })
  }  


}
