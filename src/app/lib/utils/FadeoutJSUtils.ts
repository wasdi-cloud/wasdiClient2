export default class FadeoutUtils {
    /**
    * {JSDoc}
    *
    * The splice() method changes the content of a string by removing a range of
    * characters and/or adding new characters.
    *
    * @this {String}
    * @param {number} start Index at which to start changing the string.
    * @param {number} delCount An integer indicating the number of old chars to remove.
    * @param {string} newSubStr The String that is spliced in.
    * @return {string} A new string with the spliced substring.
    */
    static utilsInsertSubstringIntoString(sString, start, delCount, newSubStr) {
        return sString.slice(0, start) + newSubStr + sString.slice(start + Math.abs(delCount));
    }
    /**
     *
     * @param sString
     * @returns {boolean}
     */
    static utilsIsStrNullOrEmpty(sString: string) {
        if (sString && typeof sString != 'string') {
            throw "[Utils.isStrNullOrEmpty] The value is NOT a string";

        }

        if (sString && sString.length > 0)
            return false; // string has content
        else
            return true; // string is empty or null
    }

    /**
     *
     * @param oObject
     * @returns {boolean}
     */
    static utilsIsObjectNullOrUndefined(oObject) {
        if (oObject == null || oObject == undefined)
            return true;
        return false;

    }
    /**
     *
     * @param sValue
     * @returns {boolean}
     */
    static utilsIsEmail(sValue: string) {
        if (this.utilsIsStrNullOrEmpty(sValue))
            return false;

        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(sValue);
    }

    /**
     *
     * @param sString1
     * @param sString2
     * @returns {boolean}
     */
    //sString1 contains sString2
    static utilsIsSubstring(sString1: string, sString2: string) {
        if (this.utilsIsStrNullOrEmpty(sString1) || this.utilsIsStrNullOrEmpty(sString2)) {
            console.log("Error, Invalid String ");
            return false;
        }

        if (sString1.indexOf(sString2) == -1)
            return false;
        return true;
    }
    /**
     * Check if String contains case insensitive 
     * @param sSource
     * @param sStrToSearch
     * @returns {boolean}
     */
    static utilsStrContainsCaseInsensitive(sSource: string, sStrToSearch: string) {
        if (sSource == null) {
            return false;
        }
        let s1 = sSource.toLowerCase();
        let s2 = sStrToSearch.toLowerCase();
        return (s1.indexOf(s2) > -1);
    }

    /**
     * Remove spaces from a string
     * @param sString
     */
    static utilsRemoveSpaces(sString: string) {
        sString.replace(/\s/g, "")
    }

    /**
     *
     * @param oValue
     * @returns {boolean}
     */
    static utilsIsANumber(oValue) {

        //isNaN(123) //false
        //isNaN(-1.23) //false
        //isNaN(5-2) //false
        //isNaN(0) //false
        //isNaN('123') //false
        //isNaN('Hello') //true
        //isNaN('2005/12/12') //true
        //isNaN('') //false
        //isNaN(true) //false
        //isNaN(undefined) //true
        //isNaN('NaN') //true
        //isNaN(NaN) //true
        //isNaN(0 / 0) //true
        if (isNaN(oValue) == false)
            return true;
        return false;
    }

    //TODO TEST IT
    static utilsRemoveObjectInArrayByIndex(iIndex: number, aArray: any[]) {
        if (iIndex > -1) {
            aArray.splice(iIndex, 1);
            return true;
        } else {
            return false;
        }

    }

    //TODO TEST IT
    static utilsRemoveObjectInArray(aoArray: any[], oObject) {
        if (this.utilsIsObjectNullOrUndefined(aoArray) === true)
            return false;
        let iLengthArray = aoArray.length;
        for (let iIndexArray = 0; iIndexArray < iLengthArray; iIndexArray++) {
            if (aoArray[iIndexArray] === oObject) {
                this.utilsRemoveObjectInArrayByIndex(iIndexArray, aoArray);
                return true;
            }
        }

        return false;
    }

    static utilsIsElementInArray(aoArray: any[], oObject) {
        if (this.utilsIsObjectNullOrUndefined(aoArray) === true)
            return false;
        let iLengthArray = aoArray.length;
        for (let iIndexArray = 0; iIndexArray < iLengthArray; iIndexArray++) {
            if (aoArray[iIndexArray] === oObject)
                return true;
        }
        return false;
    }

    /*
    * return index of object in array
    * return -1 if there are some error or the object isn't inside array
    * */
    /**
     *
     * @param oArray
     * @param oObject
     * @returns {number}
     */
    static utilsFindObjectInArray(oArray: any[], oObject) {
        //ERROR PARAMS == NULL OR UNDEFINED
        if (this.utilsIsObjectNullOrUndefined(oArray) || this.utilsIsObjectNullOrUndefined(oObject))
            return -1;
        // 0 ELEMENTS IN ARRAY
        if (oArray.length == 0)
            return -1;

        let iArrayLength = oArray.length;
        for (let iIndex = 0; iIndex < iArrayLength; iIndex++) {
            if (oArray[iIndex] == oObject)
                return iIndex;
        }
        /* the object isn't inside array */
        return -1;
    }

    /**
     *
     * @param sString
     * @returns {boolean}
     */
    static utilsIsString(sString: string) {
        if (sString && typeof sString == 'string') {
            return true;
        }
        return false;

    }

    /**
     * isInteger
     * @param oInput
     * @returns {boolean}
     */

    static utilsIsInteger(oInput: any) {
        if (this.utilsIsANumber(oInput) == false)
            return false;
        return oInput % 1 === 0;
    }

    static utilsIsOdd(iNum: number) {
        return (iNum % 2) == 1;
    }

    /*************** LOCAL STORAGE UTILS ********************/
    //TODO TEST LOCAL STORAGE FUNCTIONS
    /**
     *
     * @returns {boolean}
     */
    static utilsCheckIfBrowserSupportLocalStorage() {
        if (typeof (Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            return true;
        }
        else {
            // Sorry! No Web Storage support..
            //TODO Error with dialog
            console.log("Error no web storage support");
            return false;
        }

    }

    /*
     * Set local storage, if sName is empty or null return false
     * */
    /**
     *
     * @param sName
     * @param sValue
     * @returns {boolean}
     */
    static utilsSetItemLocalStorage(sName: string, sValue: string) {
        if (this.utilsIsStrNullOrEmpty(sName))
            return false
        localStorage.setItem(sName, sValue);
        return true
    }


    /* Get local value
     * */
    /**
     *
     * @param sName
     * @returns {boolean}
     */
    static utilsGetItemInLocalStorage(sName: string) {
        if (this.utilsIsStrNullOrEmpty(sName))
            return false;
        //retrieve
        return localStorage.getItem(sName);
    }

    /* Remove Item
     * */
    /**
     *
     * @param sName
     * @returns {boolean}
     */
    static utilsRemoveLocalStorageItem(sName: string) {
        if (this.utilsIsStrNullOrEmpty(sName))
            return false;
        localStorage.removeItem(sName);
        return true;
    }


    /************************* COOKIES ***************************/

    //TODO TEST COOKIES functions !!
    //set by w3school.com
    /**
     *
     * @param sName
     * @param sValue
     * @param exdays
     */
    static utilsSetCookie(sName: string, sValue: string, exdays: number) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let iExpires = "expires=" + d.toUTCString();
        ////FOR OBJECT ELEMENT I ADD cvalue=JSON.stringify(cvalue);
        //cvalue=JSON.stringify(cvalue);
        document.cookie = sName + "=" + sValue + ";" + iExpires + ";path=/";
    }

    //get by w3school.com
    /**
     *
     * @param sName
     * @returns {*}Whoops! Lost connection to undefined
     */
    static utilsGetCookie(sName: string) {
        let name = sName + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
                //return JSON.parse(c.substring(name.length,c.length));//FOR OBJECT ELEMENT I ADD JSON.parse()
            }
        }
        return "";
    }

    /************************ TIMESTAMP ************************/
    static utilsGetTimeStamp() {
        // return (new Date().getTime());
        let currentdate = new Date();
        let datetime = "Last Sync: " + currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        return datetime;
    }

    static utilsSleep(milliseconds: number) {
        let start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }
    /********************* WEBGL *********************/
    static utilsBrowserSupportWebGl() {
        if (window.WebGLRenderingContext)//check if browser supports WebGL
        {
            return true;
        }
        else {
            return false;
        }
    }

    static utilsMakeFile(sText: string, textFile, sType: string) {

        let data = new Blob([sText], { type: sType });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
    }

    static utilsSaveFile(sUrl: string, sFilename: string) {
        if (this.utilsIsObjectNullOrUndefined(sUrl) === true) {
            return false;
        }
        if ((this.utilsIsObjectNullOrUndefined(sFilename) === true) || (this.utilsIsStrNullOrEmpty(sFilename) === true)) {
            sFilename = "default"
        }
        let a = document.createElement("a");
        document.body.appendChild(a);
        //a.style = "display: none";
        a.href = sUrl;
        a.download = sFilename;
        a.click();
        window.URL.revokeObjectURL(sUrl);

        return true;
    }

    static utilsUserUseIEBrowser() {
        let ua = window.navigator.userAgent;
        let msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            // return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            return true;
        }

        let trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            // let rv = ua.indexOf('rv:');
            // return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            return true;

        }

        let edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            // return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            return true;
        }

        // other browser
        return false;
        // let msie = ua.indexOf("MSIE ");
        //
        // if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number
        // {
        //     return true;
        //    // alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
        // }
        // else  // If another browser, return 0
        // {
        //     return false;
        //    //alert('otherbrowser');
        // }
        //
        // return false;
    }

    static utilsGetPropertiesObject(obj) {
        if (this.utilsIsObjectNullOrUndefined(obj))
            return [];
        let aProperties = [];
        for (let property in obj) {
            aProperties.push(property);
        }
        return aProperties;
    }

    //CHECK IF FEBRUARY HAS 29 DAYS
    static utilsLeapYear(year: number) {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }

    //from 1 to iValue
    static utilsGenerateArrayWithFirstNIntValue(iStartingValue: number, iEndValue: number) {
        if (this.utilsIsObjectNullOrUndefined(iEndValue) === true || (this.utilsIsInteger(iEndValue) === false)) {
            return null;
        }
        if (this.utilsIsObjectNullOrUndefined(iStartingValue) === true || (this.utilsIsInteger(iStartingValue) === false)) {
            return null;
        }
        let aiReturnArray = [];
        for (let iIndexArray = iStartingValue; iIndexArray < iEndValue; iIndexArray++) {
            aiReturnArray[iIndexArray] = iIndexArray;
        }
        return aiReturnArray;
    }


    static utilsVariableIsAnArray(variable) {
        return variable.constructor === Array
    }


    static utilsGetMidPoint(iPointAX: number, iPointAY: number, iPointBX: number, iPointBY: number) {
        if (this.utilsIsANumber(iPointAX) === false || this.utilsIsANumber(iPointAY) === false || this.utilsIsANumber(iPointBX) === false || this.utilsIsANumber(iPointBY) === false) {
            return null;
        }

        let iMidPointX = (iPointAX + iPointBX) / 2;
        let iMidPointY = (iPointAY + iPointBY) / 2;

        return {
            x: iMidPointX,
            y: iMidPointY
        }
    }

    static utilsCalculateDistanceBetweenTwoPoints(x1: number, y1: number, x2: number, y2: number) {
        // let a = x1 - x2;
        // let b = y1 - y2;

        let a = x2 - x1;
        let b = y2 - y1;
        //
        // console.log("---------------------- utilsCalculateDistanceBetweenTwoPoints ----------------------")
        // console.log("x1:" + x1)
        // console.log("y1:" + y1)
        // console.log("x2:" + x2)
        // console.log("y2:" + y2)
        // console.log("y2:" + y2)
        // console.log("a:" + a)
        // console.log("b:" + b)

        let fDistance = Math.sqrt(a * a + b * b);
        // console.log("fDistance:" + fDistance)
        return fDistance;
    }

    /**
     *
     * @param x
     * @param y
     * @param pointARectangleX
     * @param pointARectangleY
     * @param pointBRectangleX
     * @param pointBRectangleY
     * @returns {boolean}
     */
    static utilsIsPointInsideSquare(x: number, y: number, pointARectangleX: number, pointARectangleY: number, pointBRectangleX: number, pointBRectangleY: number) {
        let x1 = Math.min(pointARectangleX, pointBRectangleX);
        let x2 = Math.max(pointARectangleX, pointBRectangleX);
        let y1 = Math.min(pointARectangleY, pointBRectangleY);
        let y2 = Math.max(pointARectangleY, pointBRectangleY);
        if ((x1 <= x) && (x <= x2) && (y1 <= y) && (y <= y2)) {
            // console.log(x1 + "," + x + "," + x2);
            // console.log(y1 + "," + y + "," + y2);
            return true;
        } else {
            return false;
        }
    }

    static utilsConvertRGBAInObjectColor(sRGBA) {
        //rgba input value examples
        // "rgb(255,255,255)" or "rgb(255,255,255,1)"
        if (this.utilsIsStrNullOrEmpty(sRGBA) === true)
            return null;

        sRGBA = sRGBA.split("r");
        sRGBA = sRGBA[1].split("g");
        sRGBA = sRGBA[1].split("b");
        sRGBA = sRGBA[1].split("(");
        sRGBA = sRGBA[1].split(")");
        sRGBA = sRGBA[0].split(",");

        if (this.utilsIsObjectNullOrUndefined(sRGBA) === true)
            return null;

        let oReturnValue: {
            red: number,
            green: number,
            blue: number,
            transparency?: number
        }   = {
            red: sRGBA[0],
            green: sRGBA[1],
            blue: sRGBA[2], 
        };

        if (sRGBA.length === 4) {
            oReturnValue.transparency = sRGBA[3];
        }
        else {
            oReturnValue.transparency = 1;
        }
        return oReturnValue;
    }

    static utilsComponentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    static utilsRgbToHex(r, g, b) {
        return "#" + this.utilsComponentToHex(r) + this.utilsComponentToHex(g) + this.utilsComponentToHex(b);
    }


    static utilsSearchTree(element, matchingTitle, sPropertyIdNodeName: string, sChildrenNodeName: string) {
        if (this.utilsIsStrNullOrEmpty(sPropertyIdNodeName) === true) {
            throw "utilsSearchTree static sPropertyIdNodeName is null or undefined";
        }
        if (this.utilsIsStrNullOrEmpty(sChildrenNodeName) === true) {
            throw "utilsSearchTree static sChildrenNodeName is null or undefined";
        }
        if (element[sPropertyIdNodeName] == matchingTitle) {
            return element;
        } else if (element[sChildrenNodeName] != null) {
            let i;
            let result = null;
            for (i = 0; result == null && i < element[sChildrenNodeName].length; i++) {
                result = this.utilsSearchTree(element[sChildrenNodeName][i], matchingTitle, sPropertyIdNodeName, sChildrenNodeName);
            }
            return result;
        }
        return null;
    }
}