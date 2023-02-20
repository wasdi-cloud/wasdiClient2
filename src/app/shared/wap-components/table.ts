import { UIComponent } from "./ui-component";

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