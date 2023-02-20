import { UIComponent } from "./ui-component";

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