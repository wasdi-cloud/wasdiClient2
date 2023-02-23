import { UIComponent } from "./ui-component";

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