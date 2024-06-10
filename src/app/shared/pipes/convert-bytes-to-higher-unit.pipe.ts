import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertBytesToHigherUnit'
})
export class ConvertBytesToHigherUnitPipe implements PipeTransform {

  transform(bytes, precision): string {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }

}
