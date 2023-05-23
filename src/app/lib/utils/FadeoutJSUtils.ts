export default class FadeoutUtils {
    static isObjectNullOrUndefined(oObject: Object) {
        if(oObject === null || oObject === undefined) {
            return true;
        }
        return false;
    }
}