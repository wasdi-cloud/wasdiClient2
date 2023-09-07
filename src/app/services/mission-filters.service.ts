import { Injectable } from '@angular/core';
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class MissionFiltersService {

  constructor() { }

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
          }
        }
      } else {
        if (!oMissionFilter.visibilityConditions) {
          bIsFilterVisible = false;
          break;
        }
      }
      if (bIsFilterVisible === true) {
        aoVisibileFilters.push(oFilter);
      }
    }
    return aoVisibileFilters; 
  }
}
