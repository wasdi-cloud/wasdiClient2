import { Injectable } from '@angular/core';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class MissionFiltersService {

  constructor() { }

  missionFilter: string = '';

  setAdvancedFilter(modelFilter: any) {
    let filter: string = '';

    if (modelFilter == null) return this.missionFilter;
    if (modelFilter == undefined) return this.missionFilter;

    filter = filter + ' OR (' + modelFilter.indexname + ':' + modelFilter.indexvalue;
    for (let j = 0; j < modelFilter.filters.length; j++) {
      if (modelFilter.filters[j].indexvalue && modelFilter.filters[j].indexvalue.trim() != '') {
        if (modelFilter.filters[j].indexname && modelFilter.filters[j].indexname.trim() != '') {

          if (modelFilter.filters[j].visibilityConditions && modelFilter.filters[j].visibilityConditions.trim() != '') {
            let visibilityConditionsArray = modelFilter.filters[j].visibilityConditions.split("&");

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
              filter = filter + ' AND ' + modelFilter.filters[j].indexname + ':'
                + modelFilter.filters[j].indexvalue;
            }
          } else {
            filter = filter + ' AND ' + modelFilter.filters[j].indexname + ':'
              + modelFilter.filters[j].indexvalue;
          }
        }
        else {
          filter = filter + ' AND ' + modelFilter.filters[j].indexvalue;
        }
      }
    }
    filter = filter + ')';

    filter = filter.replace('OR', ''); //cut the first OR espression
    return this.missionFilter = filter;
  }

  getAdvancedFilter() {
    return this.missionFilter;
  }


  /**
   * 
   * @param aoAllFilters 
   * @param oMissionFilter 
   * @returns 
   */
  setFilterVisibility(aoAllFilters: any, oMissionFilter?: any) {
    let aoVisibileFilters: Array<any> = [];
    //Safe Programming Check: If mission is not defined, return all the filters
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oMissionFilter) === true) {
      return aoAllFilters;
    }

    for (let oFilter of aoAllFilters) {
      let bIsFilterVisible: boolean = true;

      // If the filter has visibility conditions:
      if (oFilter.visibilityConditions) {
        // Split the Visibility conditions at each individual condition:
        let asVisibilityCondiitons = oFilter.visibilityConditions.split("&");
        for (let sVisibilityCondition of asVisibilityCondiitons) {
          let sInnerVisibilityConditions: string;

          // If the visibilityCondition begins with brackets (there is more than one condition), then trim the brakets
          if (sVisibilityCondition.startsWith("(") && sVisibilityCondition.endsWith(")")) {
            sInnerVisibilityConditions = sVisibilityCondition.substring(1, sVisibilityCondition.length - 1);
          } else {
            //If only one Visibility Condition, set that condition.
            sInnerVisibilityConditions = sVisibilityCondition;
          }
          if (sInnerVisibilityConditions.includes("|")) {
            let asInnerVisibilityConditionsArray: Array<string> = sInnerVisibilityConditions.split("|");

            let bInnerFilterVisibleFlag = false;

            for (let innerVisibilityCondition of asInnerVisibilityConditionsArray) {
              if (oMissionFilter.includes(innerVisibilityCondition)) {
                bInnerFilterVisibleFlag = true;
                break;
              }
            }
            if (!bInnerFilterVisibleFlag) {
              bIsFilterVisible = false;
              break;
            }
          } else {
            if (!oMissionFilter.includes(sVisibilityCondition)) {
              bIsFilterVisible = false;
            }
          }

        }
      }
      if (bIsFilterVisible === true) {
        aoVisibileFilters.push(oFilter);
      }
    }
    return aoVisibileFilters;
  }
}
