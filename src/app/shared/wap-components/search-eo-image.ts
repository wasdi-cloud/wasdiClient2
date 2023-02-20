import { UIComponent } from "./ui-component";
import { ProductList } from "./product-list";
import { DateTimePicker } from "./date-time-picker";
import { SelectArea } from "./select-area";

export class SearchEOImage extends UIComponent {
    oTableOfProducts: ProductList;
    oStartDate: DateTimePicker;
    oEndDate: DateTimePicker;
    oSelectArea: SelectArea;
    aoProviders: any[];
    aoMissionFilters: [];

    constructor() {
        super();

        this.oTableOfProducts = new ProductList();
        this.oStartDate = new DateTimePicker();
        this.oEndDate = new DateTimePicker();
        this.oSelectArea = new SelectArea();
        this.aoProviders = [];
        this.aoProviders.push("ONDA");
        this.aoMissionFilters = [];
    }

    getValue() {
        return ""
    }

    getStringValue() {
        return "";
    }

}
