import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppUIItems } from 'src/app/components/navbar/menu-list-item/menu-items';
import { JsonEditorService } from 'src/app/services/json-editor.service';
@Component({
  selector: 'app-processor-tab-ui',
  templateUrl: './processor-tab-ui.component.html',
  styleUrls: ['./processor-tab-ui.component.css']
})
export class ProcessorTabUiComponent implements OnInit, AfterViewInit {
  //Declare name for appui id
  public readonly appui = "appui";
  @ViewChild('editor') editorRef!: ElementRef;
  m_bUIChanged: boolean = false;
  m_sProcessorUI: string = "{}";
  m_sJSONSample: string;
  m_sTextToInsert: string = "";
  @Input() m_oProcessor?: any;
  @Input() m_oProcessorUIInfo: FormGroup;
  @Output() m_sProcessorUIChange: EventEmitter<any> = new EventEmitter<any>()

  m_aoAppUIItems = AppUIItems;

  constructor(
    private m_oJsonEditorService: JsonEditorService
  ) { }

  ngOnInit(): void {
    this.m_sProcessorUI = this.m_oProcessorUIInfo.get('sProcessorUI').value;
    console.log(this.m_oProcessorUIInfo)
  }

  ngAfterViewInit(): void {
    this.m_oJsonEditorService.setEditor(this.editorRef);
    this.m_oJsonEditorService.initEditor();
    this.m_oJsonEditorService.setText(this.m_sProcessorUI);
  }

  /**
   * Create JSON snippet based on text input and add to textarea
   * @param sElementType 
   */
  addUIElement(sElementType: string) {
    let sTextToInsert = "";

    if (sElementType === "tab") {
      sTextToInsert =
        '\n\t{\n\t\t"name": "Tab Name",\n\t\t"controls": [\n\t\t]\n\t},';
    } else if (sElementType === "textbox") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "textbox",\n\t\t"label": "description",\n\t\t"default": "",\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "numeric") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "numeric",\n\t\t"label": "description",\n\t\t"default": "0",\n\t\t"min": 0,\n\t\t"max": 100,\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "dropdown") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "dropdown",\n\t\t"label": "description",\n\t\t"default": "",\n\t\t"values": [],\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "bbox") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "bbox",\n\t\t"label": "Bounding Box",' +
        '\n\t\t"required": false,\n\t\t"tooltip":"",' +
        '\n\t\t"maxArea": 0,' +
        '\n\t\t"maxSide": 0,' +
        '\n\t\t"maxRatioSide": 0' +
        "\n\t},";
    } else if (sElementType === "slider") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "slider",\n\t\t"label": "description",\n\t\t"default": 0,\n\t\t"min": 0,\n\t\t"max": 100,\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "date") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "date",\n\t\t"label": "Date",\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "boolean") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "boolean",\n\t\t"label": "description",\n\t\t"default": false,\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "productscombo") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "productscombo",\n\t\t"label": "Product",\n\t\t"required": false,\n\t\t"tooltip":"",\n\t\t"showExtension": false\n\t},';
    } else if (sElementType === "searcheoimage") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "searcheoimage",\n\t\t"label": "Description",\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "hidden") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "hidden",\n\t\t"default": ""\n\t},';
    } else if (sElementType === "renderAsStrings") {
      sTextToInsert = '\n\t"renderAsStrings": true,\n\t';
    } else if (sElementType === "listbox") {
      sTextToInsert =
        '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "listbox",\n\t\t"label": "description",\n\t\t"values": [],\n\t\t"required": false,\n\t\t"tooltip":""\n\t},';
    } else if (sElementType === "table") {
      sTextToInsert = '\n\t{\n\t\t"param": "PARAM_NAME",\n\t\t"type": "table",\n\t\t"label": "description",\n\t\t"required": false,\n\t\t"tooltip":"",\n\t\t"rows":"",\n\t\t"columns":"",\n\t\t"row_headers":[],\n\t\t"col_headers":[]\n\t},'
    }

    //Handle textarea insertion
    this.insetText(sTextToInsert);

    this.m_oProcessorUIInfo.patchValue({
      bUIChanged: true
    });
  }

  getJsonText(oEvent) {
    this.m_sProcessorUI = this.m_oJsonEditorService.getValue();
    this.patchProcessorValue();
  }

  /**
   * Handle text insertion into UI JSON Textbox
   * @param sText 
   */
  insetText(sText: string) {
    this.m_oJsonEditorService.insertText(sText);
    this.m_sProcessorUI = this.m_oJsonEditorService.getValue();
    this.patchProcessorValue();
  }

  /**
   * Format JSON 
   */
  formatJSON() {
    this.m_sProcessorUI = JSON.stringify(JSON.parse(this.m_sProcessorUI.replaceAll("'", '"')), null, 4);
    this.m_oJsonEditorService.setText(this.m_sProcessorUI);
    this.patchProcessorValue();
  }

  patchProcessorValue() {
    this.m_oProcessorUIInfo.patchValue({
      sProcessorUI: this.m_sProcessorUI
    })
  }
}
