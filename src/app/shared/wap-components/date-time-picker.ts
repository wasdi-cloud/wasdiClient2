import { UIComponent } from "./ui-component";
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
            return null;
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
            return null;
        }
    }
}