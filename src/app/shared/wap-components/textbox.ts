import { UIComponent } from "./ui-component";

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