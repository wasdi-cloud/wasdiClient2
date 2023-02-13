export class UIComponent {
    tooltip: string;
    constructor() {
        this.tooltip = "";
    }
}

export class Checkbox extends UIComponent {
    m_bValue: boolean;

    constructor() {
        super();

        this.m_bValue = true;
    }

    /**
     * Return the value of the checkbox
     * @returns {boolean} True if selected, False if not
     */
    getValue() {
        return this.m_bValue;
    }

    /**
     * Return the value of the checkbox as a string:
     * 1 = true 0 = false
     * @returns {string}
     */
    getStringValue() {
        if (this.m_bValue) {
            return "1";
        } else {
            return "0";
        }
    }
}

export class DateTimePicker extends UIComponent {
    m_sDate: string | null
    constructor() {
        super();

        this.m_sDate = null;
    }
    /**
    * Returns the selected Date
    * @returns {string|null} Date as a string in format YYYY-MM-DD
    */
    getValue() {
        if (this.m_sDate) {
            return this.m_sDate;
        } else {
            return "";
        }
    }

    /**
     * Returns the selected Date
     * @returns {string|null} Date as a string in format YYYY-MM-DD
     */
    getStringValue() {
        if (this.m_sDate) {
            return this.m_sDate;
        } else {
            return "";
        }
    }
}

export class Dropdown extends UIComponent {
    asListValues: string[];
    oSelectedValue: any;
    oOnClickFunction: {} | null;
    bEnableSearchFilter: boolean;
    sDropdownName: string;

    constructor() {
        super();
        this.asListValues = [];
        this.oSelectedValue = {};
        this.oOnClickFunction = null;
        this.bEnableSearchFilter = true;
        this.sDropdownName = "";
    }
    /**
    * Get the selected value
    * @returns {string}
    */
    getValue() {
        return this.oSelectedValue.name;
    }

    /**
     * Get the selected value
     * @returns {string}
     */
    getStringValue() {
        return this.oSelectedValue.name;
    }
}

export class Hidden {
    m_oValue: string;
    constructor() {
        this.m_oValue = "";
    }

    getValue() {
        return this.m_oValue;
    }

    getStringValue() {
        return String(this.m_oValue);
    }
}

export class Listbox extends UIComponent {
    aoElements: {}[];
    aoSelected: {}[];
    constructor() {
        super();

        this.aoElements = [];
        this.aoSelected = [];
    }

    /**
     * Return the selected product
     * @returns {{}}
     */
    getValue() {
        return this.aoSelected;
    }

    /**
     * Return the name of the selected product
     * @returns {{}}
     */
    getStringValue() {

        let sReturn = "";
        let iSel = 0;

        if (this.aoSelected != undefined) {
            if (this.aoSelected != null) {
                for (iSel = 0; iSel < this.aoSelected.length; iSel++) {
                    if (iSel > 0) sReturn = sReturn + ";";
                    sReturn = sReturn + this.aoSelected[iSel];
                }
            }
        }
        return sReturn;
    }

}

export class NumericBox extends UIComponent {
    m_sText: string;
    m_fMin: number | null;
    m_fMax: number | null;
    constructor() {
        super();

        this.m_sText = "";
        this.m_fMin = null;
        this.m_fMax = null;
    }
    isValid(asMessages) {
        try {
            let fValue = parseFloat(this.m_sText)
            // if we can't parse the value as a number
            if (isNaN(fValue)) {
                // asMessages.push(this.label + " - Please check parameters ");
                return false;
            }
            if (this.m_fMin) {
                if (fValue < this.m_fMin) {
                    //asMessages.push(this.label + " - Value must be greater than " + this.m_fMin);
                    return false;
                }
            }

            if (this.m_fMax) {
                if (fValue > this.m_fMax) {
                    //asMessages.push(this.label + " - Value must be smaller than " + this.m_fMax);
                    return false;
                }
            }
        }
        catch (oError) {
            return false;
        }

        return true;
    }

    getValue() {
        return parseFloat(this.m_sText);
    }

    getStringValue() {
        return this.m_sText.toString();
    }
}

export class ProductList extends UIComponent {
    aoProducts: [];
    bIsAvailableSelection: boolean;
    bIsSingleSelection: boolean;
    oSingleSelectionLayer: {};

    constructor() {
        super();

        this.aoProducts = [];
        this.bIsAvailableSelection = false;
        this.bIsSingleSelection = true;
        this.oSingleSelectionLayer = {};
    }

    getValue() {
        return this.oSingleSelectionLayer;
    }

    getStringValue() {
        return this.oSingleSelectionLayer;
    }
}

export class ProductsCombo extends UIComponent {
    asListValues: [];
    sSelectedValues: any;
    oOnClickFunction: {} | null;
    bEnableSearchFilter: boolean;
    sDropdownName: string;
    bShowExtension: boolean

    constructor(bShowExt: boolean) {
        super();

        this.asListValues = [];
        this.sSelectedValues = "";
        this.oOnClickFunction = null;
        this.bEnableSearchFilter = true;
        this.sDropdownName = "";
        this.bShowExtension = bShowExt;
    }

    getValue() {
        return this.sSelectedValues;
    }

    getStringValue() {
        return this.sSelectedValues;
    }
}

export class SearchEOImage extends UIComponent {
    oTableOfProducts: ProductList;
    oStartDate: DateTimePicker;
    oEndDate: DateTimePicker;
    oSelectArea: SelectArea;
    aoProviders: any[];
    aoMissionFilters: [];

    constructor() {
        super();

        this.oTableOfProducts = new ProductList();
        this.oStartDate = new DateTimePicker();
        this.oEndDate = new DateTimePicker();
        this.oSelectArea = new SelectArea();
        this.aoProviders = [];
        this.aoProviders.push("ONDA");
        this.aoMissionFilters = [];
    }

    getValue() {
        return ""
    }

    getStringValue() {
        return "";
    }

}

export class SelectArea extends UIComponent {
    maxArea = 0;
    maxSide = 0;
    maxRatioSide = 0;
    oBoundingBox: {
        northEast: string,
        southWest: string
    }
    iWidth: string;
    iHeight: string;
    constructor() {
        super();
        // using zero as default to relax the constraints
        this.maxArea = 0;
        this.maxSide = 0;
        this.maxRatioSide = 0;
        this.oBoundingBox = {
            northEast: "",
            southWest: ""
        };
        this.iWidth = "";
        this.iHeight = "";

    }
    /**
    * Return the bbox as a JSON Object
    * @returns {{southWest: {lat: "", lon:""}, northEast: {lat: "", lon:""}}|string}
    */
    getValue() {
        try {
            return this.oBoundingBox;
        }
        catch (e) {
            return "";
        }
    }
    /**
    * Return the bounding box as a string.
    * @returns {string} BBox as string: LATN,LONW,LATS,LONE
    */
    getStringValue = function () {
        try {
            if (this.oBoundingBox) {
                return "" + this.oBoundingBox.northEast.lat.toFixed(2) + "," + this.oBoundingBox.southWest.lng.toFixed(2) + "," + this.oBoundingBox.southWest.lat.toFixed(2) + "," + + this.oBoundingBox.northEast.lng.toFixed(2);
            }
            else {
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    isValid(asMessages) {
        // this checks that the value assigned is different from the default.
        return this.oBoundingBox.northEast != "" && this.oBoundingBox.southWest != "";
    }
}

export class Slider extends UIComponent {
    m_iMin: number;
    m_iMax: number;
    m_iValue: number;

    constructor() {
        super();

        this.m_iMin = 0;
        this.m_iMax = 10;
        this.m_iValue = 5;
    }
    getValue() {
        return this.m_iValue;
    }

    getStringValue() {
        return String(this.m_iValue)
    }
}

export class Table extends UIComponent {
    aoTableVariables: any[];
    constructor() {
        super();

        this.aoTableVariables = [];
    }

    getValue() {
        return this.aoTableVariables;
    }

    getStringValue() {
        return JSON.stringify(this.aoTableVariables);
    }
}
export class Textbox extends UIComponent {
    m_sText: string;

    constructor() {
        super();

        this.m_sText = "";
    }

    getValue() {
        return this.m_sText;
    }

    getStringValue() {
        return this.m_sText;
    }
}