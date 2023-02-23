import { UIComponent } from "./ui-component";
export class Checkbox extends UIComponent {
    m_bValue: boolean;

    constructor() {
        super();

        this.m_bValue = true;
    }

    /**
     * Return the value of the checkbox
     * @returns {boolean} True if selected, False if not
     */
    getValue() {
        return this.m_bValue;
    }

    /**
     * Return the value of the checkbox as a string:
     * 1 = true 0 = false
     * @returns {string}
     */
    getStringValue() {
        if (this.m_bValue) {
            return "1";
        } else {
            return "0";
        }
    }
}