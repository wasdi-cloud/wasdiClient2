import { UIComponent } from "./ui-component";

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
                if (!this.required) {
                    if (this.required) {
                        asMessages.push(this.label + " - Please check parameters ");
                        return false;
                    }
                }
            }
            if (this.m_fMin) {
                if (fValue < this.m_fMin) {
                    asMessages.push(this.label + " - Value must be greater than " + this.m_fMin);
                    return false;
                }
            }

            if (this.m_fMax) {
                if (fValue > this.m_fMax) {
                    asMessages.push(this.label + " - Value must be smaller than " + this.m_fMax);
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
        let fFloatValue = parseFloat(this.m_sText);
        if (isNaN(fFloatValue)) {
            return null;
        } else {
            return parseFloat(this.m_sText);
        }

    }

    getStringValue() {
        return this.m_sText.toString();
    }
}
