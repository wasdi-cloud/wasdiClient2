import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdvancedFilterService {
  missionFilter: string = ""
  constructor() { }

  setAdvancedFilter(modelFilter: any) {
    let filter: string = ""
    for (var i = 0; i < modelFilter.length; i++) {
      if (modelFilter[i].selected) {
        filter = filter + ' OR (' + modelFilter[i].indexname + ':' + modelFilter[i].indexvalue;
        for (var j = 0; j < modelFilter[i].filters.length; j++) {
          if (modelFilter[i].filters[j].indexvalue && modelFilter[i].filters[j].indexvalue.trim() != '') {
            if (modelFilter[i].filters[j].indexname && modelFilter[i].filters[j].indexname.trim() != '') {

              if (modelFilter[i].filters[j].visibilityConditions && modelFilter[i].filters[j].visibilityConditions.trim() != '') {
                let visibilityConditionsArray = modelFilter[i].filters[j].visibilityConditions.split("&");

                let isFilterVisible = true;

                for (let visibilityCondition of visibilityConditionsArray) {

                  let innerVisibilityConditions;
                  if (visibilityCondition.startsWith("(") && visibilityCondition.endsWith(")")) {
                    innerVisibilityConditions = visibilityCondition.substring(1, visibilityCondition.length - 1);
                  } else {
                    innerVisibilityConditions = visibilityCondition;
                  }

                  if (innerVisibilityConditions.includes("|")) {
                    let innerVisibilityConditionsArray = innerVisibilityConditions.split("|");

                    let innerFilterVisibleFlag = false;

                    for (let innerVisibilityCondition of innerVisibilityConditionsArray) {
                      if (filter.includes(innerVisibilityCondition)) {
                        innerFilterVisibleFlag = true;
                        break;
                      }
                    }

                    if (!innerFilterVisibleFlag) {
                      isFilterVisible = false;
                      break;
                    }
                  } else {
                    if (!filter.includes(visibilityCondition)) {
                      isFilterVisible = false;
                      break;
                    }
                  }
                }

                if (isFilterVisible) {
                  filter = filter + ' AND ' + modelFilter[i].filters[j].indexname + ':'
                    + modelFilter[i].filters[j].indexvalue;
                }
              } else {
                filter = filter + ' AND ' + modelFilter[i].filters[j].indexname + ':'
                  + modelFilter[i].filters[j].indexvalue;
              }
            }
            else {
              filter = filter + ' AND ' + modelFilter[i].filters[j].indexvalue;
            }
          }
        }
        filter = filter + ')';
      }
    }
    filter = filter.replace('OR', ''); //cut the first OR espression
    this.missionFilter = filter;

  }
  getAdvancedFilter() {
    return this.missionFilter;
  }
  clearAdvancedFilter() { }
  
  setClearAdvancedFilter(method) {
    this.clearAdvancedFilter = method;

  }
}