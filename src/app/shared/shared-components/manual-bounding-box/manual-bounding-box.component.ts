import { Component, ElementRef, Input, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConstantsService } from 'src/app/services/constants.service';
import { JsonEditorService } from 'src/app/services/json-editor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';

@Component({
  selector: 'app-manual-bounding-box',
  templateUrl: './manual-bounding-box.component.html',
  styleUrls: ['./manual-bounding-box.component.css']
})
export class ManualBoundingBoxComponent implements OnInit {
  @ViewChild('editor') m_oEditorRef!: ElementRef;
  m_oBBox = {
    north: "",
    south: "",
    east: "",
    west: ""
  }

  m_sSampleJson = {
    "northEast": {
      "lat": 44.46924732175861,
      "lng": 9.058227539062502
    },
    "southWest": {
      "lat": 44.37852536073157,
      "lng": 8.721771240234377
    }
  }

  m_sJSONParam = '{}';

  public m_bShowJSON: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ManualBoundingBoxComponent>,
    private m_oJsonEditorService: JsonEditorService,
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService) { }


  ngOnInit(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData.input) === false) { 
      this.m_oBBox = this.m_oData.input;
      this.getJsonInput()
    }
  }

  saveBoundingBox() {
    this.m_oDialogRef.close(this.m_oBBox);

  }

  toggleShowJSON() {
    this.m_bShowJSON = !this.m_bShowJSON

    if (this.m_bShowJSON === true) {
      this.showJsonParams()
    }
  }

  getJsonInput() {
    this.m_sJSONParam = this.m_oJsonEditorService.getValue();

    try {
      let parsedJson = JSON.parse(this.m_sJSONParam);
      if (parsedJson.northEast && parsedJson.southWest) {
        this.m_oBBox.north = parsedJson.northEast.lat
        this.m_oBBox.east = parsedJson.northEast.lng
        this.m_oBBox.south = parsedJson.southWest.lat
        this.m_oBBox.west = parsedJson.southWest.lng
      }
    } catch {

    }
  }

  checkJSON() {
    let sErrorMsg = this.m_oTranslate.instant("DIALOG_FORMAT_JSON_ERROR");
    let sErrorHeader = this.m_oTranslate.instant("KEY_PHRASES.ERROR");
    try {
      let oParsedJson = JSON.parse(this.m_sJSONParam);
      let sPrettyPrint = JSON.stringify(oParsedJson, null, 2);

      this.m_oJsonEditorService.setText(sPrettyPrint)

    } catch {
      this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sErrorHeader, 'danger')
    }
  }

  openInfoDialog() {
    let sMsg = this.m_oTranslate.instant("DIALOG_MANUAL_INSERT_BBOX_INFO");
    let sExampleJson = `<pre id='json'>${JSON.stringify(this.m_sSampleJson, null, 2)}</pre>`
    this.m_oNotificationDisplayService.openAlertDialog(sMsg + sExampleJson, '', 'info')
  }

  showJsonParams() {
    this.m_oJsonEditorService.setEditor(this.m_oEditorRef);
    this.m_oJsonEditorService.initEditor()
    this.m_oJsonEditorService.setText(this.m_sJSONParam);
  }

  onDismiss() {
    this.m_oDialogRef.close(null);
  }
}
