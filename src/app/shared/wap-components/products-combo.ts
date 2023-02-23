import { UIComponent } from "./ui-component";

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