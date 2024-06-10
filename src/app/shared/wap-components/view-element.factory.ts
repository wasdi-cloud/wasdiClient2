import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { formatDate } from "@angular/common";

import { Checkbox } from "./checkbox";
import { DateTimePicker } from "./date-time-picker";
import { Dropdown } from "./dropdown";
import { Hidden } from "./hidden";
import { Listbox } from "./listbox";
import { NumericBox } from "./numeric-box";
import { ProductList } from "./product-list";
import { ProductsCombo } from "./products-combo";
import { SearchEOImage } from "./search-eo-image";
import { SelectArea } from "./select-area";
import { Slider } from "./slider";
import { Table } from "./table";
import { Textbox } from "./textbox";


/**
 * Factory class to generate the User Controls of an Application Interface
 * JSON description.
 */
@Injectable()
export class ViewElementFactory {

    constructor(@Inject(LOCALE_ID) public m_oLocale: string) {

    };

    /**
     * Creates a signle View Element
     * @param oControl 
     * @returns 
     */
    public static createViewElement(oControl) {
        // Return object
        let oViewElement;

        // Domain Control: we need an input!
        if (!oControl) {
            return oViewElement;
        }
        
        // Is a required element?
        if (!oControl.required) {
            oControl.required = false;
        }

        //find the *type* and create the element
        if (oControl.type === "textbox") {

            // Text box input: allow to insert a string
            oViewElement = new Textbox();

            if (oControl.default) {
                oViewElement.m_sText = oControl.default;
            }
        } 
        else if (oControl.type === "numeric") {

            // Numeric Box Input: allow to type a number (integer or float)
            oViewElement = new NumericBox();

            if (oControl.default) {
                oViewElement.m_sText = parseFloat(oControl.default);
            }

            // Numeric Box allows to specify a min and a max value
            if (!isNaN(parseFloat(oControl.min))) {
                oViewElement.m_fMin = oControl.min;
            }

            if (!isNaN(parseFloat(oControl.max))) {
                oViewElement.m_fMax = oControl.max;
            }
        } 
        else if (oControl.type === "dropdown") {

            // Drop Down or Combo Box: allow to select a element from a list
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
                    oViewElement.oSelectedValue = oItem;
                }
            }
        } 
        else if (oControl.type === "bbox") {

            // Select Area, or bounding box.
            oViewElement = new SelectArea();

            // Support the possibility to specify:
            // Max Area 
            // Max Side
            // Max Ratio between height and width

            if (oControl.maxArea) {
                oViewElement.maxArea = oControl.maxArea;
            }
            if (oControl.maxSide) {
                oViewElement.maxSide = oControl.maxSide;
            }

            if (oControl.maxRatioSide) {
                oViewElement.maxRatioSide = oControl.maxRatioSide;
            }
        } 
        else if (oControl.type === "date") {
            // Date Input
            oViewElement = new DateTimePicker();

            if (oControl.default) {
                oViewElement.m_sDate = oControl.default;
            }
            else {
                let oNow = new Date();
                oViewElement.m_sDate = formatDate(oNow, "dd/MM/YYYY", "en");
            }
        } 
        else if (oControl.type === "productlist") {
            // List of the products in the active workspace
            oViewElement = new ProductList();
        } 
        else if (oControl.type === "searcheoimage") {
            // Mini search EO Image embedded in the UI
            oViewElement = new SearchEOImage();
        } 
        else if (oControl.type === "productscombo") {
            // Combo box with a list of the products in the active workspace

            // Product names can be shown with or without extension
            if (oControl.showExtension != undefined) {
                oViewElement = new ProductsCombo(oControl.showExtension);
            } else {
                oViewElement = new ProductsCombo(false); // back to default behaviour, in case showExtension is not specified
            }
        } 
        else if (oControl.type === "boolean") {
            // Boolean input
            oViewElement = new Checkbox();

            if (oControl.default != undefined) {
                oViewElement.m_bValue = oControl.default;
            }
        } 
        else if (oControl.type === "slider") {

            // Slider element to input a integer number
            oViewElement = new Slider();

            // Can control default, min and max values
            if (oControl.min) {
                oViewElement.m_iMin = oControl.min;
            }
            if (oControl.max) {
                oViewElement.m_iMax = oControl.max;
            }
            if (oControl.default >= 0) {
                oViewElement.m_iValue = oControl.default;
            }
        } 
        else if (oControl.type === "hidden") {
            // Hidden control: is not shown to the user. 
            // Is a way to pass default values to the app
            oViewElement = new Hidden();
            oViewElement.m_oValue = oControl.default;
        } 
        else if (oControl.type === "listbox") {
            // List Box
            oViewElement = new Listbox();

            let iValues = 0;

            oViewElement.aoElements = [];
            oViewElement.aoSelected = [];

            for (; iValues < oControl.values.length; iValues++) {
                oViewElement.aoElements.push(oControl.values[iValues]);
            }
        } 
        else if (oControl.type === 'table') {
            // Table: allow to specify the number of rows and columns and the associated headers
            oViewElement = new Table();

            for (let iRow = 0; iRow < oControl.rows; iRow++) {
                
                oViewElement.aoTableVariables.push([]);

                for (let iCol = 0; iCol < oControl.columns; iCol++) {
                    oViewElement.aoTableVariables[iRow].push('');
                }
            }

            oViewElement.rowHeaders = oControl.row_headers;
            oViewElement.colHeaders = oControl.col_headers;    
        } 
        else {
            // By default lets try to return a simple text box
            oViewElement = new Textbox();
        }

        // Do we have a tooltip to show?
        if (oControl.tooltip) {
            oViewElement.tooltip = oControl.tooltip;
        }

        // Se the common values:

        // Type of the control
        oViewElement.type = oControl.type;
        // Label
        oViewElement.label = oControl.label;
        // Associated parameter
        oViewElement.paramName = oControl.param;
        // Required flag
        oViewElement.required = oControl.required;

        // We are done with our element
        return oViewElement;
    }

    /**
     * Generate the array of View Elements for a specific tab
     * @param oTab Tab Description of the UI received from API
     * @returns Array of View Elements
     */
    public static getTabElements(oTab) {
        // We will return this list
        let aoTabElements: any[] = [];

        // For all the controls in the tab
        for (let iControl = 0; iControl < oTab.controls.length; iControl++) {
            // We take the control description
            let oControl = oTab.controls[iControl];
            // Generate the View Element
            let oViewElement = this.createViewElement(oControl);

            // And add it to our array
            aoTabElements.push(oViewElement);
        }

        // Return the list of generated View Elements
        return aoTabElements;
    }
}