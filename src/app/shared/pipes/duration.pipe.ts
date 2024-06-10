import { Pipe, PipeTransform } from '@angular/core';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {


  renderTwoDigitNumber(iNumber: number) {
    let sNumber = "00";

    if (iNumber > 0) {
      if (iNumber < 10) {
        sNumber = "0" + String(iNumber);
      } else {
        sNumber = String(iNumber);
      }
    }

    return sNumber;
  }


  transform(oProcess): string {
    let sStartDate = oProcess.operationStartDate;
    if (!oProcess.operationStartDate.endsWith("Z")) {
      sStartDate += "Z";
    }

    // start time by server
    let oStartTime: any = new Date(sStartDate);
    // still running -> assign "now"
    let oEndTime: any = new Date();
    // reassign in case the process is already ended
    if (oProcess.operationEndDate) {

      if (!oProcess.operationEndDate.endsWith("Z")) {
        oProcess.operationEndDate += "Z";
      }

      oEndTime = new Date(oProcess.operationEndDate);
    }

    if (FadeoutUtils.utilsIsValidDate(oEndTime) === false) {
      oEndTime = new Date(oProcess.lastChangeDate);
    }

    if (FadeoutUtils.utilsIsValidDate(oEndTime) === false) {
      oEndTime = new Date();
    }


    //pick time
    let iMilliseconds = Math.abs(oEndTime - oStartTime);

    //approximate result
    let iSecondsTimeSpan = Math.ceil(iMilliseconds / 1000);

    if (!iSecondsTimeSpan || iSecondsTimeSpan < 0) {
      iSecondsTimeSpan = 0;
    }

    // Calculate number of hours
    let iHours = Math.trunc(iSecondsTimeSpan / (3600));

    let iMinutesReminder = iSecondsTimeSpan - (iHours * 3600);
    let iMinutes = Math.trunc(iMinutesReminder / 60);
    let iSeconds = iMinutesReminder - (iMinutes * 60);

    let sTimeSpan = this.renderTwoDigitNumber(iHours) + ":" + this.renderTwoDigitNumber(iMinutes) + ":" + this.renderTwoDigitNumber(iSeconds);

    // var oDate = new Date(1970, 0, 1);
    // oDate.setSeconds(0 + iSecondsTimeSpan);

    // return oDate;
    return sTimeSpan;
  }

}
