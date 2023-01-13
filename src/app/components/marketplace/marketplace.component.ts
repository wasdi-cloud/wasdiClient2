import { Component, OnInit } from '@angular/core';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { MatDialog } from "@angular/material/dialog"
import { FormControl } from '@angular/forms';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
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

  m_aoApplications: any = [];

  category = new FormControl('');
  m_asCategoryOptions: any = [];
  publishers: any = [];

  publisherFilter!: string;
  searchWord!: string;

  constructor(private oProcessorService: ProcessorService, private oProcessorMediaService: ProcessorMediaService, private dialog: MatDialog) { }

  
  ngOnInit(): void {
    this.oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe(response => {
      console.log(response)
      this.m_aoApplications = response;
    })
    this.getCategories();
    this.getPublishers();
  }

  getCategories() {
    this.oProcessorMediaService.getCategories().subscribe(response => {
      this.m_asCategoryOptions = response
      console.log(response);
    })
  }

  getPublishers() {
    this.oProcessorMediaService.getPublishersFilterList().subscribe(response => {
      this.publishers = response;
      console.log(response)
    })
  }

  searchApps() {
    return this.m_aoApplications.filter(oApplication => oApplication.friendlyName.includes(this.searchWord))
  }
}