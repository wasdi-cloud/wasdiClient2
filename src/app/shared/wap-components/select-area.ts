import { UIComponent } from "./ui-component";


export class SelectArea extends UIComponent {
    maxArea = 0;
    maxSide = 0;
    maxRatioSide = 0;
    oBoundingBox: {
        northEast: string,
        southWest: string
    }
    iWidth: string;
    iHeight: string;
    constructor() {
        super();
        // using zero as default to relax the constraints
        this.maxArea = 0;
        this.maxSide = 0;
        this.maxRatioSide = 0;
        this.oBoundingBox = {
            northEast: "",
            southWest: ""
        };
        this.iWidth = "";
        this.iHeight = "";

    }
    /**
    * Return the bbox as a JSON Object
    * @returns {{southWest: {lat: "", lon:""}, northEast: {lat: "", lon:""}}|string}
    */
    getValue() {
        try {
            let sTest = this.getStringValue();

            if (sTest != "") {
                return this.oBoundingBox;
            } else {
                return null;
            }
        }
        catch (e) {
            return null;
        }
    }
    /**
    * Return the bounding box as a string.
    * @returns {string} BBox as string: LATN,LONW,LATS,LONE
    */
    getStringValue = function () {
        try {
            if (this.oBoundingBox) {
                return "" + this.oBoundingBox.northEast.lat.toFixed(2) + "," + this.oBoundingBox.southWest.lng.toFixed(2) + "," + this.oBoundingBox.southWest.lat.toFixed(2) + "," + + this.oBoundingBox.northEast.lng.toFixed(2);
            }
            else {
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    isValid(asMessages) {
        // this checks that the value assigned is different from the default.
        return this.oBoundingBox.northEast != "" && this.oBoundingBox.southWest != "";
    }
}