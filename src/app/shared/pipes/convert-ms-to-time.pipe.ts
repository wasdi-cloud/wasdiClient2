import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMsToTime'
})
export class ConvertMsToTimePipe implements PipeTransform {

  padTo2Digits(lNum) {
    return lNum.toString().padStart(2, "0");
  }

  transform(iTimeInMs: number): any {

    let lSeconds = Math.floor(iTimeInMs / 1000);
    let lMinutes = Math.floor(lSeconds / 60);
    let lHours = Math.floor(lMinutes / 60);

    lSeconds = lSeconds % 60;
    lMinutes = lMinutes % 60;

    return `${this.padTo2Digits(lHours)}:${this.padTo2Digits(lMinutes)}:${this.padTo2Digits(lSeconds)}`;
  }

}
