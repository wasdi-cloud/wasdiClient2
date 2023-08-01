import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
@Component({
  selector: 'app-processor-tab-store',
  templateUrl: './processor-tab-store.component.html',
  styleUrls: ['./processor-tab-store.component.css']
})
export class ProcessorTabStoreComponent implements OnInit {
  //Manually inserted categories
  m_aoCategories: String[] = [
    "Water", "Fire", "Population", "Buildings", "Optical", "SAR", "GIS", "Vegetation", "LU/LC", "Air Quality", "Ground Motion", "Impacts"
  ]; 

  /**
   * Input Form Group from Store Info - passed from New App Dialog Component
   */

  @Input() m_oProecessorStoreInfo: FormGroup; 

  constructor(
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService) { }

  ngOnInit(): void {
    //Uncomment when committing
    //this.getCategories();

    console.log(this.m_oProecessorStoreInfo)
  }

  getCategories() {
    this.m_oProcessorMediaService.getCategories().subscribe({
      next: oResponse => {
        console.log(oResponse);
      },
      error: oError => {
        console.log("Error in retreiving categories");
      }
    })
  }
}
