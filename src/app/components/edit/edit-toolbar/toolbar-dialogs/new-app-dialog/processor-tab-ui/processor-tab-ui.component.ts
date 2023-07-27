import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-processor-tab-ui',
  templateUrl: './processor-tab-ui.component.html',
  styleUrls: ['./processor-tab-ui.component.css']
})
export class ProcessorTabUiComponent implements OnInit, OnChanges {
  m_bUIChanged: boolean = false;
  m_sProcessorUI: string = "{}";

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    if (this.m_bUIChanged) {

    }
  }

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
    console.log(sTextToInsert);
    this.m_bUIChanged = true;
  }

  formatJSON() {
    let oController = this;
    let sStringParsed = ""
    sStringParsed = oController.m_sProcessorUI = JSON.stringify(JSON.parse(oController.m_sProcessorUI.replaceAll("'", '"')), null, 4);
  }
}
