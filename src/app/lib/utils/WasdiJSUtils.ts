export default class Utils {
    static utilsProjectConvertCurrentPositionFromServerInCesiumDegrees(sInput: string) {
        if(!sInput) {
            return []; 
        }

        let aSplitInput = sInput.split(";"); 
        let aReturnValue = []; 
        aReturnValue.push(aSplitInput[1]);
        aReturnValue.push(aSplitInput[0]);
        aReturnValue.push(aSplitInput[2]);

        return aReturnValue; 
    }
}