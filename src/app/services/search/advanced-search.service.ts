import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdvancedSearchService {

  constructor() { }

  model = { hidden: true }
  advFilter = '';

  setAdvancedSearchFilte(searchfilter, modelFilter) {

    let filter = '';
    if (modelFilter.sensingPeriodFrom && modelFilter.sensingPeriodTo) {
      filter += '( beginPosition:[' + this.formatDateFrom(searchfilter.sensingPeriodFrom) +
        ' TO ' + this.formatToDate(searchfilter.sensingPeriodTo) + '] AND endPosition:[' +
        this.formatDateFrom(searchfilter.sensingPeriodFrom) + ' TO ' + this.formatDateTo(searchfilter.sensingPeriodTo) + '] )';
    }
    else if (modelFilter.sensingPeriodFrom) {
      filter += '( beginPosition:[' + this.formatDateFrom(searchfilter.sensingPeriodFrom) +
        ' TO NOW] AND endPosition:[' + this.formatDateFrom(searchfilter.sensingPeriodFrom) + ' TO NOW] )';
    }
    else if (modelFilter.sensingPeriodTo) {
      filter += '( beginPosition:[ * TO ' + this.formatDateTo(searchfilter.sensingPeriodTo) + '] AND endPosition:[* TO ' + this.formatToDate(searchfilter.sensingPeriodTo) + ' ] )';
    }
    if (modelFilter.ingestionFrom && modelFilter.ingestionTo) {
      filter += ((filter) ? ' AND' : '') + '( ingestionDate:[' + this.formatDateFrom(searchfilter.ingestionFrom) +
        ' TO ' + this.formatDateTo(searchfilter.ingestionTo) + ' ] )';
    }
    else if (modelFilter.ingestionFrom) {
      filter += ((filter) ? ' AND' : '') + '( ingestionDate:[' + this.formatDateFrom(searchfilter.ingestionFrom) + ' TO NOW] )';
    }
    else if (modelFilter.ingestionTo) {
      filter += ((filter) ? ' AND' : '') + '( ingestionDate:[ * TO ' + this.formatDateTo(searchfilter.ingestionTo) + ' ] )';
    }

    this.advFilter = filter;
  }


  getAdvancedSearchFilter() {
    return this.advFilter;
  }

  getAdvancedSearchForSave(searchfilter: any) {
    var advSearchMap = {};
    if (searchfilter.sensingFrom) {
      advSearchMap['sensingDate'] = searchfilter.sensingFrom;
    }
    if (searchfilter.sensingTo) {
      advSearchMap['sensingDateEnd'] = searchfilter.sensingTo;
    }
    if (searchfilter.ingestionFrom) {
      advSearchMap['ingestionDate'] = searchfilter.ingestionFrom;
    }
    if (searchfilter.ingestionTo) {
      advSearchMap['ingestionDateEnd'] = searchfilter.ingestionTo;
    }
    return advSearchMap;
  }

  //// bof new methods
  formatDateFrom(dateInput) {
    var date = new Date(dateInput);
    var dateString = date.toISOString();
    return dateString;
  }
  formatDateTo(dateInput) {
    var date = new Date(dateInput);
    date.setUTCHours(23);
    date.setUTCMinutes(59);
    date.setUTCSeconds(59);
    date.setUTCMilliseconds(999);
    return date.toISOString();
  }
  //// eof new methods
  formatDate(dateInput) {
    var date = new Date(dateInput);
    var dateString = date.toISOString();
    return dateString;
  }
  formatToDate(dateInput) {
    var date = new Date(dateInput);
    date.setUTCHours(23);
    date.setUTCMinutes(59);
    date.setUTCSeconds(59);
    date.setUTCMilliseconds(999);
    return date.toISOString();
  }
  show() { }

  hide() { }

  setShow(method) {
    this.show = method;
  }
  setHid(method) {
    this.hide = method;
  }
  clearDates() {

  }

  setClearDates(method) {
    this.clearDates = method;
  }
}
