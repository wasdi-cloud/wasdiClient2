import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
@Component({
  selector: 'app-processor-tab-store',
  templateUrl: './processor-tab-store.component.html',
  styleUrls: ['./processor-tab-store.component.css']
})
export class ProcessorTabStoreComponent implements OnInit {
  //Manually inserted categories
  m_aoCategories: Array<any> = [];

  m_aoSelectedCategories: Array<any> = [];
  /**
   * Input Form Group from Store Info - passed from New App Dialog Component
   */

  @Input() m_oProcessorStoreInfo: FormGroup;

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService) { }

  ngOnInit(): void {
    //Uncomment when committing
    this.getCategories();
    this.m_aoSelectedCategories = this.m_oProcessorStoreInfo.get('aoCategories').value;

    console.log(this.m_oProcessorStoreInfo)
  }

  getCategories() {
    this.m_oProcessorMediaService.getCategories().subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoCategories = oResponse;

          this.m_aoCategories.forEach(oCategory => {
            this.isChecked(oCategory);
          })
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog( "Error in getting categories");
      }
    })
  }

  isChecked(oCategory): boolean {
    let oInputCategories = this.m_oProcessorStoreInfo.get("aoCategories").value;
    let isChecked: boolean = false
    oInputCategories.forEach(oInput => {
      if (oCategory.id == oInput) {
        oCategory.checked = true;
      }
    })
    return isChecked;
  }

  categoryChanged(oEvent, oCategory) {
    if (oEvent.checked) {
      if (this.m_aoSelectedCategories.indexOf(oCategory.id) === -1) {
        this.m_aoSelectedCategories.push(oCategory.id)
      }
    }

    if (!oEvent.checked) {
      if (this.m_aoSelectedCategories.indexOf(oCategory.id) !== -1) {
        let iCategoryIndex = this.m_aoSelectedCategories.indexOf(oCategory.id);
        this.m_aoSelectedCategories.splice(iCategoryIndex, 1);
      }
    }

    this.m_oProcessorStoreInfo.patchValue({
      aoCategories: this.m_aoSelectedCategories
    })
  }
}
