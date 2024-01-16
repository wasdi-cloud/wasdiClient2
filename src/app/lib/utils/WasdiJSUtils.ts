import FadeoutUtils from "./FadeoutJSUtils";

export default class WasdiUtils {


    static utilsProjectShowRabbitMessageUserFeedBack(oMessage, oTranslate, oController) {

        let sMessageCode = oMessage.messageCode;
        let sUserMessage = "";
        // Get extra operations
        switch (sMessageCode) {
            case "DOWNLOAD":
                sUserMessage = oTranslate.instant("MSG_DOWNLOAD");
                break;
            case "PUBLISHBAND":
                sUserMessage = oTranslate.instant("MSG_PUBLISHBAND_1") + oMessage.payload.bandName + "MSG_PUBLISHBAND_2" + oMessage.payload.productName + "MSG_MSG_PUBLISHBAND_3";
                break;
            case "UPDATEPROCESSES":
                console.log("UPDATE PROCESSES" + " " + FadeoutUtils.utilsGetTimeStamp());
                break;
            case "MOSAIC":
                sUserMessage = oTranslate.instant("MSG_MOSAIC");
                break;
            case "SUBSET":
                sUserMessage = oTranslate.instant("MSG_SUBSET");
                break;
            case "MULTISUBSET":
                sUserMessage = oTranslate.instant("MSG_MULTISUBSET");
                break;
            case "GRAPH":
                sUserMessage = oTranslate.instant("MSG_GRAPH");
                break;
            case "RUNPROCESSOR":
                sUserMessage = oTranslate.instant("MSG_RUNPROCESSOR");
                break;
            case "RUNIDL":
                sUserMessage = oTranslate.instant("MSG_RUNPROCESSOR");
                break;
            case "RUNMATLAB":
                sUserMessage = oTranslate.instant("MSG_RUNPROCESSOR");
                break;
            case "FTPUPLOAD":
                sUserMessage = oTranslate.instant("MSG_FTPUPLOAD");
                break;
            case "RASTERGEOMETRICRESAMPLE":
                sUserMessage = oTranslate.instant("MSG_RASTERGEOMETRICRESAMPLE");
                break;
            case "FILTER":
                sUserMessage = oTranslate.instant("MSG_FILTER");
                break;
            case "REGRID":
                sUserMessage = oTranslate.instant("MSG_REGRID");
                break;
            case "DEPLOYPROCESSOR":
                sUserMessage = oTranslate.instant("MSG_DEPLOYPROCESSOR");
                break;
            case "DELETEPROCESSOR":
                sUserMessage = oTranslate.instant("MSG_DELETEPROCESSOR");
                break;
            case "INFO":
            case "ENVIRONMENTUPDATE":
            case "DELETEPROCESSOR":
                sUserMessage = oMessage.payload;
                break;
            case "REDEPLOYPROCESSOR":
                sUserMessage = oTranslate.instant("MSG_REDEPLOYPROCESSOR");
                break;
            case "LIBRARYUPDATE":
                sUserMessage = oTranslate.instant("MSG_LIBRARYUPDATE");
                break;
            case "KILLPROCESSTREE":
                sUserMessage = oTranslate.instant("MSG_KILLPROCESSTREE");
                break;
            case "READMETADATA":
                sUserMessage = oTranslate.instant("MSG_READMETADATA");
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
            // let oAudio = new Audio('assets/audio/message.wav');
            // oAudio.play();            
            let oUserMessage = {
                ...oMessage,
                displayMessage: sUserMessage,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                seen: false
            }
            oController.m_oNotificationsQueueService.setNotifications(oUserMessage);
            oController.m_oNotificationDisplayService.openSnackBar(sUserMessage, "Close", "right", "bottom");
        }
        return "";
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

    /****************************************************** MODALS ******************************************************/

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