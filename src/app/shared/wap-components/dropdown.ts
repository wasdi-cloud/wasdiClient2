import { UIComponent } from "./ui-component";
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