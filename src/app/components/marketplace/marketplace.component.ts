import { Component, OnInit } from '@angular/core';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { MatDialog } from "@angular/material/dialog"
import { FormControl } from '@angular/forms';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';


interface AppFilter {
  categories: [];
  publishers: string[],
  name: "",
  score: 0,
  minPrice: -1,
  maxPrice: 1000,
  itemsPerPage: 12,
  page: 0,
  orderBy: string,
  orderDirection: 1
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css']
})
export class MarketplaceComponent implements OnInit {
  publisher: string;
  m_oAppFilter: AppFilter = {
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
    this.getApplications();
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

  getApplications() {
    this.oProcessorService.getMarketplaceList(this.m_oAppFilter).subscribe(oResponse => {
      this.m_aoApplications = oResponse
    })
  }

  developerChanged(event) {
    if (this.m_oAppFilter.publishers.length !== 0 || event.target.value === 'all') {
      this.m_oAppFilter.publishers.splice(0, this.m_oAppFilter.publishers.length)
      console.log(this.m_oAppFilter)
    }
    if (event.target.value === 'all') {
      this.getApplications()
    } else {
      this.m_oAppFilter.publishers.push(event.target.value);
      this.getApplications()
    }

  }
  //Success rate will need to be added
  successChanged() {

  }

  //most used will need to be added
  usedChanged() {

  }

  maxPriceChanged(event) {
    this.m_oAppFilter.maxPrice = event.target.value;

    this.getApplications()
  }

  ratingChanged(event) {
    this.m_oAppFilter.score = event.target.value;
    this.getApplications()
  }
}