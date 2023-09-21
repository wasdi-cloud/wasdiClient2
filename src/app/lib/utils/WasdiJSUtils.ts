import FadeoutUtils from "./FadeoutJSUtils";

export default class WasdiUtils {

    

    static utilsProjectConvertJSONFromServerInOptions(oJSONInput) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput) == true)
            return null;
        let iNumberOfParameters = oJSONInput.length;
        if (iNumberOfParameters == 0)
            return null;

        let oNewObjectOutput = {};
        for (let iIndexParameter = 0; iIndexParameter < iNumberOfParameters; iIndexParameter++) {
            if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput[iIndexParameter]) == true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput[iIndexParameter].field) == true) ||
                (FadeoutUtils.utilsIsStrNullOrEmpty(oJSONInput[iIndexParameter].field) == true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput[iIndexParameter].defaultValue) == true)) {
                continue;
            }
            else {
                switch (oJSONInput[iIndexParameter].defaultValue) {
                    case "true": oNewObjectOutput[oJSONInput[iIndexParameter].field] = true;//convert string in boolean
                        break;
                    case "false": oNewObjectOutput[oJSONInput[iIndexParameter].field] = false;//convert string in boolean
                        break;
                    default: oNewObjectOutput[oJSONInput[iIndexParameter].field] = oJSONInput[iIndexParameter].defaultValue;
                }


            }
        }
        return oNewObjectOutput;
    }

    static utilsProjectGetArrayOfValuesForParameterInOperation(oJSONInput, sProperty: string) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput) === true) {
            return null;
        }
        let iNumberOfParameters = oJSONInput.length;
        if (iNumberOfParameters === 0)
            return null;
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(sProperty) === true)
            return null;


        for (let iIndexParameter = 0; iIndexParameter < iNumberOfParameters; iIndexParameter++) {
            // if field === sProperty
            if ((FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput[iIndexParameter]) === false) && (FadeoutUtils.utilsIsObjectNullOrUndefined(oJSONInput[iIndexParameter].field) === false)
                && (oJSONInput[iIndexParameter].field === sProperty)) {

                if (oJSONInput[iIndexParameter].valueSet.length !== 0) {
                    // if valueSet isn't empty
                    return oJSONInput[iIndexParameter].valueSet;
                }
            }
        }
    }

    static utilsProjectShowRabbitMessageUserFeedBack(oMessage) {

        let sMessageCode = oMessage.messageCode;
        let sUserMessage = "";
        // Get extra operations
        switch (sMessageCode) {
            case "DOWNLOAD":
                sUserMessage = "MSG_DOWNLOAD";
                break;
            case "PUBLISHBAND":
                sUserMessage = "MSG_PUBLISHBAND_1" + oMessage.payload.bandName + "MSG_PUBLISHBAND_2" + oMessage.payload.productName + "MSG_MSG_PUBLISHBAND_3";
                break;
            case "UPDATEPROCESSES":
                console.log("UPDATE PROCESSES" + " " + FadeoutUtils.utilsGetTimeStamp());
                break;
            case "MOSAIC":
                sUserMessage = "MSG_MOSAIC";
                break;
            case "SUBSET":
                sUserMessage = "MSG_SUBSET";
                break;
            case "MULTISUBSET":
                sUserMessage = "MSG_MULTISUBSET";
                break;
            case "GRAPH":
                sUserMessage = "MSG_GRAPH";
                break;
            case "RUNPROCESSOR":
                sUserMessage = "MSG_RUNPROCESSOR";
                break;
            case "RUNIDL":
                sUserMessage = "MSG_RUNPROCESSOR";
                break;
            case "RUNMATLAB":
                sUserMessage = "MSG_RUNPROCESSOR";
                break;
            case "FTPUPLOAD":
                sUserMessage = "MSG_FTPUPLOAD";
                break;
            case "RASTERGEOMETRICRESAMPLE":
                sUserMessage = "MSG_RASTERGEOMETRICRESAMPLE";
                break;
            case "FILTER":
                sUserMessage = "MSG_FILTER";
                break;
            case "REGRID":
                sUserMessage = "MSG_REGRID";
                break;
            case "DEPLOYPROCESSOR":
                sUserMessage = "MSG_DEPLOYPROCESSOR";
                break;
            case "DELETEPROCESSOR":
                sUserMessage = "MSG_DELETEPROCESSOR";
                break;
            case "INFO":
            case "ENVIRONMENTUPDATE":
            case "DELETEPROCESSOR":
                sUserMessage = oMessage.payload;
                break;
            case "REDEPLOYPROCESSOR":
                sUserMessage = "MSG_REDEPLOYPROCESSOR";
                break;
            case "LIBRARYUPDATE":
                sUserMessage = "MSG_LIBRARYUPDATE";
                break;
            case "KILLPROCESSTREE":
                sUserMessage = "MSG_KILLPROCESSTREE";
                break;
            case "READMETADATA":
                sUserMessage = "MSG_READMETADATA";
                break;
            case "TERMINATEJUPYTERNOTEBOOK":
            case "LAUNCHJUPYTERNOTEBOOK":
                sUserMessage = "";
                break;
            default:
                console.log("ERROR: GOT EMPTY MESSAGE<br>READY");
        }

        // Is there a feedback for the user?
        if (!FadeoutUtils.utilsIsStrNullOrEmpty(sUserMessage)) {
            let oAudio = new Audio('assets/audio/message.wav');
            oAudio.play();

            return sUserMessage;

            //this.m_oNotificationDisplayService
            // Give the short message
            //Add new Dialog engine
            // let oDialog = FadeoutUtils.utilsVexDialogAlertBottomRightCorner(sUserMessage);
            // FadeoutUtils.utilsVexCloseDialogAfter(6000, oDialog);
        }
        return "";
    }

    static utilsProjectConvertPositionsSatelliteFromServerInCesiumArray(aaArrayInput: any[]) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(aaArrayInput) === true)
            return [];
        if (aaArrayInput.length === 0)
            return [];

        let iLengthArray = aaArrayInput.length;
        let aReturnArray = [];
        let aTemp = [];
        for (let iIndexArray = 0; iIndexArray < iLengthArray; iIndexArray++) {
            aTemp = aaArrayInput[iIndexArray].split(";");

            // skip if aTemp is wrong
            if (FadeoutUtils.utilsIsObjectNullOrUndefined(aTemp) === true || aTemp.length !== 4)
                continue;

            aReturnArray.push(aTemp[1]);//push log
            aReturnArray.push(aTemp[0]);//push lat
            aReturnArray.push(aTemp[2]);//push alt
        }

        return aReturnArray;
    }

    static utilsProjectConvertCurrentPositionFromServerInCesiumDegrees(sInput: string) {
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sInput) === true)
            return [];

        let aSplitedInput = sInput.split(";")
        let aReturnValue = [];
        aReturnValue.push(aSplitedInput[1]);
        aReturnValue.push(aSplitedInput[0]);
        aReturnValue.push(aSplitedInput[2]);
        return aReturnValue;
    }

    static projectConvertCurrentPositionFromServerInCesiumDegrees(sInput: string) {
        if (!sInput) {
            return [];
        }

        let aSplitInput = sInput.split(";");
        let aReturnValue = [];
        aReturnValue.push(aSplitInput[1]);
        aReturnValue.push(aSplitInput[0]);
        aReturnValue.push(aSplitInput[2]);

        return aReturnValue;
    }

    static utilsProjectCheckInDialogIfProductNameIsInUsed(sProductName, aoListOfProducts) {
        if (aoListOfProducts === null || sProductName === null)
            return false;
        let iNumberOfProducts = aoListOfProducts.length;
        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
            if (aoListOfProducts[iIndexProduct].name === sProductName)
                return true;
        }
        return false;
    }

    static utilsProjectGetSelectedBandsByProductName(sProductName, asSelectedBands) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedBands) === true)
            return null;

        let iNumberOfSelectedBands = asSelectedBands.length;
        let asReturnBandsName = [];
        for (let iIndexSelectedBand = 0; iIndexSelectedBand < iNumberOfSelectedBands; iIndexSelectedBand++) {
            //check if the asSelectedBands[iIndexSelectedBand] is a sProductName band
            if (FadeoutUtils.utilsIsSubstring(asSelectedBands[iIndexSelectedBand], sProductName)) {
                let sBandName = asSelectedBands[iIndexSelectedBand].replace(sProductName + "_", "");
                asReturnBandsName.push(sBandName);
            }
        }

        return asReturnBandsName;
    }


    static utilsProjectGetProductByName(sName, aoProducts) {
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sName) === true)
            return null;
        let iNumberOfProducts = aoProducts.length;

        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
            if (aoProducts[iIndexProduct].name === sName) {
                return aoProducts[iIndexProduct];
            }
        }
        return null;
    }

    static utilsProjectGetBandsFromSelectedProducts(asSelectedProducts, aoProducts) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedProducts) === true)
            return null;
        let iNumberOfSelectedProducts = asSelectedProducts.length;
        let asProductsBands = [];
        for (let iIndexSelectedProduct = 0; iIndexSelectedProduct < iNumberOfSelectedProducts; iIndexSelectedProduct++) {
            let oProduct = this.utilsProjectGetProductByName(asSelectedProducts[iIndexSelectedProduct], aoProducts);
            let iNumberOfBands;

            if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.bandsGroups.bands) === true)
                iNumberOfBands = 0;
            else
                iNumberOfBands = oProduct.bandsGroups.bands.length;

            for (let iIndexBand = 0; iIndexBand < iNumberOfBands; iIndexBand++) {
                if (FadeoutUtils.utilsIsObjectNullOrUndefined(oProduct.bandsGroups.bands[iIndexBand]) === false) {
                    asProductsBands.push(oProduct.name + "_" + oProduct.bandsGroups.bands[iIndexBand].name);
                }
            }
        }
        return asProductsBands;
        // return ["test","secondo"];
    }


    static utilsProjectGetProductsName(aoProducts) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProducts) === true) {
            return []
        }
        let iNumberOfProducts = aoProducts.length;
        let asReturnValue = [];
        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
            asReturnValue.push(aoProducts[iIndexProduct].name);
        }
        return asReturnValue;
    }
    /****************************************************** MODALS ******************************************************/

    /**
     *
     * @param oCallback
     * @param oOptions
     * @param sTemplateUrl
     * @param sControllerName
     * @returns {boolean}
     */
    static utilsProjectOpenDialog(oCallback, oOptions, sTemplateUrl, sControllerName, oModalService) {
        /*
        Example of options
        {
            products:oController.m_aoProducts,
            selectedProduct:oSelectedProduct
        }
        * */
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sTemplateUrl) === true || FadeoutUtils.utilsIsStrNullOrEmpty(sControllerName) || FadeoutUtils.utilsIsObjectNullOrUndefined(oModalService)) {
            return false;
        }

        //ADD NEW MODAL BOX
        // oModalService.showModal({
        //     templateUrl: sTemplateUrl,
        //     controller: sControllerName,
        //     inputs: {
        //         extras: oOptions
        //     }
        // }).then(static (modal) {
        //     modal.element.modal();
        //     modal.close.then(oCallback)
        // });
        return true;
    }

    /**
     *
     * @param oCallback
     * @param oOptions
     * @returns {boolean}
     */
    static utilsProjectOpenGetListOfWorkspacesSelectedModal(oCallback, oOptions, oModalService) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oCallback) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(oModalService)) {
            return false;
        }

        this.utilsProjectOpenDialog(oCallback, oOptions, "dialogs/get_list_of_workspace_selected/GetListOfWorkspacesSelectedView.html", "GetListOfWorkspacesController", oModalService)

        return true;
    }

    /**
     *
     * @param sFileName
     * @param sBandName
     * @param sFilters
     * @param iRectangleX
     * @param iRectangleY
     * @param iRectangleWidth
     * @param iRectangleHeight
     * @param iOutputWidth
     * @param iOutputHeight
     * @returns {{productFileName: *, bandName: *, filterVM: *, vp_x: *, vp_y: *, vp_w: *, vp_h: *, img_w: *, img_h: *}}
     */
    static utilsProjectCreateBodyForProcessingBandImage(sFileName: string, sBandName: string, sFilters: string, iRectangleX: number, iRectangleY: number, iRectangleWidth: number, iRectangleHeight: number, iOutputWidth: number, iOutputHeight: number) {

        let oBandImageBody = {
            "productFileName": sFileName,
            "bandName": sBandName,
            "filterVM": sFilters,
            "vp_x": iRectangleX,
            "vp_y": iRectangleY,
            "vp_w": iRectangleWidth,
            "vp_h": iRectangleHeight,
            "img_w": iOutputWidth,
            "img_h": iOutputHeight
        };

        return oBandImageBody;
    };

    /**
     * getMapContainerSize
     * @returns {{height: number, width: number}}
     */
    static utilsProjectGetMapContainerSize() {
        return this.utilsProjectGetContainerSize(('#mapcontainer'));
    }

    /**
     *
     * @returns {{height, width}}
     */
    static utilsProjectGetPreviewContainerSize() {

        return this.utilsProjectGetContainerSize(('#panelBodyMapPreviewEditor'));
    }

    /**
     * utilsProjectGetContainerSize
     * @param sIdContainer
     * @returns {*}
     */
    static utilsProjectGetContainerSize(sIdContainer: string) {
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sIdContainer) === true) {
            return null;
        }

        try {
            // let elementMapContainer = angular.element(document.querySelector(sIdContainer));
            // let heightMapContainer = elementMapContainer[0].offsetHeight;
            // let widthMapContainer = elementMapContainer[0].offsetWidth;

            // return {
            //     height: heightMapContainer,
            //     width: widthMapContainer
            // };
        }
        catch (error) {
            return null;
        }

    }

    static utilsProjectGetPolygonArray(sPolygonString: string) {
        if (FadeoutUtils.utilsIsStrNullOrEmpty(sPolygonString) === true) {
            return null;
        }

        let sTemp = sPolygonString;
        sTemp = sTemp.replace("POLYGON", "");
        sTemp = sTemp.replace("((", "");
        sTemp = sTemp.replace("))", "");
        let asReturnTemp = sTemp.split(",");

        return asReturnTemp;
    }

    static utilsProjectGetDropdownMenuListFromProductsList(aoProduct: any[]) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProduct) === true) {
            return [];
        }
        let iNumberOfProducts = aoProduct.length;
        let aoReturnValue = [];
        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {

            let oValue = {
                name: aoProduct[iIndexProduct].name,
                id: aoProduct[iIndexProduct].fileName
            };
            aoReturnValue.push(oValue);
        }

        return aoReturnValue;
    }

    static utilsProjectDropdownGetSelectedProduct(aoProduct: any[], oSelectedProduct) {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(aoProduct) === true) {
            return [];
        }
        let iNumberOfProducts = aoProduct.length;
        let oReturnValue = {};
        for (let iIndexProduct = 0; iIndexProduct < iNumberOfProducts; iIndexProduct++) {
            if (oSelectedProduct.name === aoProduct[iIndexProduct].name) {
                oReturnValue = aoProduct[iIndexProduct];
                break;
            }

        }
        return oReturnValue;
    }

    /**
     * Converts the WASDI Operation Code in a more user friendly description
     * @param {Object} oOperation 
     */
    static utilsConvertOperationToDescription(oOperation) {
        let sOperation = oOperation.operationType;
        let sDescription = oOperation.operationType;

        let sSubType = "";

        if (FadeoutUtils.utilsIsStrNullOrEmpty(oOperation.operationSubType) == false) {
            sSubType = " - " + oOperation.operationSubType;
        }

        if (sOperation == "RUNPROCESSOR") {
            sDescription = "APP"
        }
        else if (sOperation == "RUNIDL") {
            sDescription = "APP"
        }
        else if (sOperation == "RUNMATLAB") {
            sDescription = "APP"
        }
        else if (sOperation == "INGEST") {
            sDescription = "INGEST"
        }
        else if (sOperation == "DOWNLOAD") {
            sDescription = "FETCH"
        }
        else if (sOperation == "PUBLISHBAND") {
            sDescription = "PUBLISH"
        }
        else if (sOperation == "GRAPH") {
            sDescription = "WORKFLOW"
        }
        else if (sOperation == "DEPLOYPROCESSOR") {
            sDescription = "DEPLOY"
        }

        sDescription = sDescription + sSubType;

        return sDescription;
    }

}