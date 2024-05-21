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

            if (this.m_sDate.indexOf("/")>=0) {
                var aoDateParts = this.m_sDate.split("/");      
                this.m_sDate = ""+aoDateParts[2]+"-"+ aoDateParts[1] + "-" +aoDateParts[0];          
            }
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

            if (this.m_sDate.indexOf("/")>=0) {
                var aoDateParts = this.m_sDate.split("/");      
                this.m_sDate = ""+aoDateParts[2]+"-"+ aoDateParts[1] + "-" +aoDateParts[0];          
            }
                        
            return this.m_sDate;
        } else {
            return null;
        }
    }
}