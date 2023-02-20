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