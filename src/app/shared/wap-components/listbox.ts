import { UIComponent } from "./ui-component";
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