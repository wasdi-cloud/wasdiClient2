import { Injectable } from "@angular/core";
import { Checkbox, DateTimePicker, Dropdown, Hidden, Listbox, NumericBox, ProductList, ProductsCombo, SearchEOImage, SelectArea, Slider, Table, Textbox } from "./ui-component";

@Injectable()
export class ViewElementFactory {
    createViewElement(oControl) {
        let oViewElement;
        if (!oControl) {
            return oViewElement;
        }
        if (!oControl.required) {
            oControl.required = false;
        }

        //find the *type* and create the element
        if (oControl.type === "textbox") {
            oViewElement = new Textbox();

            if (oControl.default) {
                oViewElement.m_sText = oControl.default;
            }
        } else if (oControl.type === "numeric") {
            oViewElement = new NumericBox();

            if (oControl.default) {
                oViewElement.m_sText = parseFloat(oControl.default);
            }

            if (!isNaN(parseFloat(oControl.min))) {
                oViewElement.m_fMin = oControl.min;
            }

            if (!isNaN(parseFloat(oControl.max))) {
                oViewElement.m_fMax = oControl.max;
            }
        } else if (oControl.type === "dropdown") {
            oViewElement = new Dropdown();

            let iValues = 0;

            oViewElement.asListValues = [];

            for (; iValues < oControl.values.length; iValues++) {
                let oItem = {
                    name: oControl.values[iValues],
                    id: "" + iValues
                };

                oViewElement.asListValues.push(oItem);

                if (oControl.default === oItem.name) {
                    oViewElement.sSelectedValues = oItem;
                }
            }
        } else if (oControl.type === "bbox") {
            oViewElement = new SelectArea();

            if (oControl.maxArea) {
                oViewElement.maxArea = oControl.maxArea;
            }
            if (oControl.maxSide) {
                oViewElement.maxSide = oControl.maxSide;
            }

            if (oControl.maxRatioSide) {
                oViewElement.maxRatioSide = oControl.maxRatioSide;
            }
        } else if (oControl.type === "date") {
            oViewElement = new DateTimePicker();
        } else if (oControl.type === "productlist") {
            oViewElement = new ProductList();
        } else if (oControl.type === "searcheoimage") {
            oViewElement = new SearchEOImage();
        } else if (oControl.type === "productscombo") {
            if (oControl.showExtension != undefined) {
                oViewElement = new ProductsCombo(oControl.showExtension);
            } else {
                oViewElement = new ProductsCombo(false); // back to default behaviour, in case showExtension is not specified
            }
        } else if (oControl.type === "boolean") {
            oViewElement = new Checkbox();

            if (oControl.default) {
                oViewElement.m_bValue = oControl.default;
            }
        } else if (oControl.type === "slider") {
            oViewElement = new Slider();

            if (oControl.min) {
                oViewElement.m_iMin = oControl.min;
            }
            if (oControl.max) {
                oViewElement.m_iMax = oControl.max;
            }
            if (oControl.default) {
                oViewElement.m_iValue = oControl.default;
            }
        } else if (oControl.type === "hidden") {
            oViewElement = new Hidden();
            oViewElement.m_oValue = oControl.default;
        } else if (oControl.type === "listbox") {
            // List Box
            oViewElement = new Listbox();

            let iValues = 0;

            oViewElement.aoElements = [];
            oViewElement.aoSelected = [];

            for (; iValues < oControl.values.length; iValues++) {
                oViewElement.aoElements.push(oControl.values[iValues]);
            }
        } else if (oControl.type === 'table') {

            oViewElement = new Table();

            for (let sRowHeader = 0; sRowHeader < oControl.rows; sRowHeader++) {
                const sElement = oControl.row_headers[sRowHeader];
                oViewElement.aoTableVariables.push([])
                for (let sColHeader = 0; sColHeader < oControl.columns; sColHeader++) {
                    const sElement = oControl.col_headers[sColHeader];
                    oViewElement.aoTableVariables[sRowHeader].push('');
                }
            }

        } else {
            oViewElement = new Textbox();
        }
        if (oControl.tooltip) {
            oViewElement.tooltip = oControl.tooltip;
        }
        oViewElement.type = oControl.type;
        oViewElement.label = oControl.label;
        oViewElement.paramName = oControl.param;
        oViewElement.required = oControl.required;
        oViewElement.rowHeaders = oControl.row_headers;
        oViewElement.colHeaders = oControl.col_headers;
        
        return oViewElement
    }

    getTabElements(oTab) {
        let aoTabElements: any[] = [];

        for (let iControl = 0; iControl < oTab.controls.length; iControl++) {
            let oControl = oTab.controls[iControl];
            let oViewElement = this.createViewElement(oControl);

            aoTabElements.push(oViewElement);
        }
        return aoTabElements;
    }
}