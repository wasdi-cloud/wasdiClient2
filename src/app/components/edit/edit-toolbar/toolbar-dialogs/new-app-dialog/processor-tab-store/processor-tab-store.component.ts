import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ImageService } from 'src/app/services/api/image.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
@Component({
  selector: 'app-processor-tab-store',
  templateUrl: './processor-tab-store.component.html',
  styleUrls: ['./processor-tab-store.component.css']
})
export class ProcessorTabStoreComponent implements OnInit {
  /**
   * Input Form Group from Store Info - passed from New App Dialog Component
   */
  @Input() m_oProcessorStoreInfo: FormGroup;

  /**
   * Input for general processor information (i.e., processorID)
   */
  @Input() m_oProcessor: any = null;

  /**
   * Manually inserted categories
   */
  m_aoCategories: Array<any> = [];

  /**
   * Array of selected categories (on init includes the categories already selected)
   */
  m_aoSelectedCategories: Array<any> = [];

  m_sApplicationImageName: string = "";

  m_sProcessorLogoName: string = "";

  m_oApplicationImage: any = null;
  m_oImageToUpload: any = null;
  m_oProcessorLogo: any = null;


  constructor(
    private m_oImageService: ImageService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oProcessorMediaService: ProcessorMediaService,
    private m_oProcessorService: ProcessorService,
    private m_oTranslate: TranslateService) { }

  ngOnInit(): void {
    //Uncomment when committing
    this.getCategories();
    this.m_aoSelectedCategories = this.m_oProcessorStoreInfo.get('aoCategories').value;
  }

  getCategories() {
    let sErrorMsg: string = this.m_oTranslate.instant("MSG_WAPPS_CATEGORY_ERROR")
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
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, '', 'danger');
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
    oCategory.checked = !oCategory.checked;

    if (!oCategory.checked) {
      if (this.m_aoSelectedCategories.indexOf(oCategory.id) !== -1) {
        let iCategoryIndex = this.m_aoSelectedCategories.indexOf(oCategory.id);
        this.m_aoSelectedCategories.splice(iCategoryIndex, 1);
      }
    } else {
      if (this.m_aoSelectedCategories.indexOf(oCategory.id) === -1) {
        this.m_aoSelectedCategories.push(oCategory.id)
      }
    }
    this.m_oProcessorStoreInfo.patchValue({
      aoCategories: this.m_aoSelectedCategories
    })
  }

  updateProcessorLogo() {
    let sSuccessMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_MEDIA_LOGO_SAVED");

    let sGuruMeditation: string = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
    let sErrorMsg: string = this.m_oTranslate.instant("DIALOG_PROCESSOR_MEDIA_LOGO_ERROR")

    //Check for uploaded file:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oProcessorLogo)) {
      console.log("Please upload a file");
      return false;
    }

    this.m_oImageService.uploadProcessorLogo(this.m_oProcessor.processorId, this.m_oProcessorLogo).subscribe({
      next: oResponse => {
        this.m_oNotificationDisplayService.openSnackBar(sSuccessMsg, this.m_oTranslate.instant("KEY_PHRASES.SUCCESS"), 'success-snackbar');
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sGuruMeditation, 'danger');
      }
    });
    return true;
  }

  removeProcessorImage(oImage: any) {

  }

  onTextareaInput(oEvent) {
    this.m_oProcessorStoreInfo.patchValue({
      sLongDescription: oEvent.target.value
    })
  }

  getSelectedLogo(oEvent: any) {
    this.m_sProcessorLogoName = oEvent.name;
    this.m_oProcessorLogo = oEvent.file;
  }


  getSelectedAppImage(oEvent: any) {
    this.m_sApplicationImageName = oEvent.name;
    this.m_oApplicationImage = oEvent.file;
  }
}
