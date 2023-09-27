import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faSave, faTrash, faX } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from 'src/app/services/api/product.service';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css']
})
export class AdvancedFiltersComponent implements OnInit {
  faX = faX;
  faSave = faSave;
  faTrash = faTrash;

  m_sFileName: string = "";

  //TODO REMOVE IT
  m_oAdvanceFilter = {
    filterActive: "Seasons",//Seasons,Range,Months
    savedData: [],
    selectedSeasonYears: [],
    selectedSeason: "",
    listOfYears: [],
    listOfMonths: [],
    // listOfDays:[],
    selectedYears: [],
    selectedDayFrom: "",
    selectedDayTo: "",
    selectedMonthFrom: "",
    selectedMonthTo: "",
    selectedYearsSearchForMonths: [],
    selectedMonthsSearchForMonths: []
  };

  test = [{
    description: 'miao',
    selected: false,
    link: ''
  }];

  m_oAdvanceFilterOptions = {
    listOfYears: this.getLastNYears(20),
    listOfMonths: this.getListOfMonths(),
    listOfDays: this.getListOfDays(31),
    listOfSeasons: this.getSeasonsList(),
    selectedYears: [],
    selectedMonths: [],
    selectedDays: [],
    selectedSeasons: [],
    savedData: []
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<AdvancedFiltersComponent>,
    private m_oProductService: ProductService,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngOnInit(): void {
    this.initDefaultYears();//TODO REMOVE IT
    this.initDefaultMonths();//TODO REMOVE IT

  }

  getPeriod(iMonthFrom: number, iDayFrom: number, iMonthTo: number, iDayTo: number) {
    //Safe Programming check:
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(iMonthFrom) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(iDayFrom) === true) ||
      (FadeoutUtils.utilsIsObjectNullOrUndefined(iMonthTo) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(iDayTo) === true)) {
      return null;
    }
    let dateSensingPeriodFrom = new Date();
    let dateSensingPeriodTo = new Date();
    dateSensingPeriodFrom.setMonth(iMonthFrom);
    dateSensingPeriodFrom.setDate(iDayFrom);
    dateSensingPeriodTo.setMonth(iMonthTo);
    dateSensingPeriodTo.setDate(iDayTo);
    return {
      dateSensingPeriodFrom: dateSensingPeriodFrom,
      dateSensingPeriodTo: dateSensingPeriodTo
    }
  }

  getPeriodSpring() {
    return this.getPeriod(2, 21, 5, 20);
  }

  getPeriodSummer() {
    return this.getPeriod(5, 21, 8, 22);
  }

  getPeriodAutumn() {
    return this.getPeriod(8, 23, 11, 20);
  }

  getPeriodWinter() {
    return this.getPeriod(11, 21, 2, 20);
  }

  saveDataInAdvancedFilter(sName: string, oData: any, aoSavedData?: Array<any>) {
    //Safe Programming Check:
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true || FadeoutUtils.utilsIsStrNullOrEmpty(sName) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSavedData)) {
      return false;
    }

    let oInputData = {
      name: sName,
      data: oData
    };

    let iNumberOfSaveData = aoSavedData.length;
    for (let iIndexSaveData = 0; iIndexSaveData < iNumberOfSaveData; iIndexSaveData++) {
      if (aoSavedData[iIndexSaveData].name === oInputData.name) {
        return false;
      }
    }
    aoSavedData.push(oInputData);

    return true;
  }

  removeSaveDataChips(oData: any) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oData) === true)
      return false;
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.savedData) === true)
      return false;
    let iNumberOfSaveData = this.m_oAdvanceFilterOptions.savedData.length;

    for (let iIndexNumberOfSaveData = 0; iIndexNumberOfSaveData < iNumberOfSaveData; iIndexNumberOfSaveData++) {
      if (this.m_oAdvanceFilterOptions.savedData[iIndexNumberOfSaveData] === oData) {
        this.m_oAdvanceFilterOptions.savedData.splice(iIndexNumberOfSaveData, 1);
        break;
      }
    }

    return true;
  }

  initDefaultYears() {
    this.m_oAdvanceFilter.listOfYears = this.getLastNYears(20);
  }

  getLastNYears(iNumber: number): Array<any> {
    if (FadeoutUtils.utilsIsInteger(iNumber) === false) {
      return null;
    }
    let aiReturnListOfYeras = [];
    let oActualDate = new Date();
    let iYears = oActualDate.getFullYear();
    for (let iIndexYear = 0; iIndexYear < iNumber; iIndexYear++) {
      aiReturnListOfYeras.push(iYears.toString());
      iYears--;
    }
    return aiReturnListOfYeras;
  }

  initDefaultMonths() {
    /*
              January - 31 days
              February - 28 days in a common year and 29 days in leap years
              March - 31 days
              April - 30 days
              May - 31 days
              June - 30 days
              July - 31 days
              August - 31 days
              September - 30 days
              October - 31 days
              November - 30 days
              December - 31 days
          * */
    let asMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let iIndex = 0; iIndex < asMonths.length; iIndex++) {
      this.m_oAdvanceFilter.listOfMonths.push(asMonths[iIndex]);
    }
  }

  getListOfMonths() {
    /*
            January - 31 days
            February - 28 days in a common year and 29 days in leap years
            March - 31 days
            April - 30 days
            May - 31 days
            June - 30 days
            July - 31 days
            August - 31 days
            September - 30 days
            October - 31 days
            November - 30 days
            December - 31 days
        * */
    let asMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let asReturnValue = [];
    for (let iIndex = 0; iIndex < asMonths.length; iIndex++) {
      asReturnValue.push(asMonths[iIndex]);
    }
    return asReturnValue;
  }

  getMonthDays(sMonth: string, sYear: string) {
    let sMonthLowerCase = sMonth.toLocaleLowerCase();
    switch (sMonthLowerCase) {
      case "january":
        return 31;
      case "february":

        if (FadeoutUtils.utilsLeapYear(sYear)) {
          return 29
        }
        else {
          return 28;
        }
      case "march":
        return 31;
      case "april":
        return 30;
      case "may":
        return 31;
      case "june":
        return 30;
      case "july":
        return 31;
      case "august":
        return 31;
      case "september":
        return 30;
      case "october":
        return 31;
      case "november":
        return 30;
      case "december":
        return 31;
      //Default 0 to catch possible error:
      default:
        return 0;
    }
  }

  getListOfDays(iNumberOfDays: number) {
    if (FadeoutUtils.utilsIsInteger(iNumberOfDays) === false) {
      return [];
    }
    let asReturnValue = [];
    for (let iIndex = 0; iIndex < iNumberOfDays; iIndex++) {
      asReturnValue.push((iIndex + 1).toString());
    }
    return asReturnValue;
  }

  getMonthDaysFromRangeOfMonths(sMonth: string, asYears: Array<string>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asYears) === true)
      return [];
    if (asYears.length < 1)
      return [];
    let iNumberOfYears = asYears.length;
    let sMonthLowerCase = sMonth.toLocaleLowerCase();
    let iReturnValue = 0;
    if ((sMonthLowerCase === "february")) {
      for (let iIndexYear = 0; iIndexYear < iNumberOfYears; iIndexYear++) {
        let iTemp = this.getMonthDays(sMonth, asYears[iIndexYear])
        //if true it takes the new value, in the case of leap years it takes 29 days
        if (iTemp > iReturnValue)
          iReturnValue = iTemp;
      }
    }
    else {
      iReturnValue = this.getMonthDays(sMonth, asYears[0]);
    }
    return FadeoutUtils.utilsGenerateArrayWithFirstNIntValue(1, iReturnValue);
  }

  convertNameMonthInNumber(sName: string) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(sName) === true)
      return -1;

    let sMonthLowerCase = sName.toLocaleLowerCase();
    switch (sMonthLowerCase) {
      case "january":
        return 0;
      case "february":
        return 1;
      case "march":
        return 2;
      case "april":
        return 3;
      case "may":
        return 4;
      case "june":
        return 5;
      case "july":
        return 6;
      case "august":
        return 7;
      case "september":
        return 8;
      case "october":
        return 9;
      case "november":
        return 10;
      case "december":
        return 11;

    }
    return -1;
  }

  addFilterMonths() {
    if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilter.selectedYearsSearchForMonths) === true) || (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilter.selectedMonthsSearchForMonths) === true)) {
      return false;
    }
    let iNumberOfSelectedYears = this.m_oAdvanceFilter.selectedYearsSearchForMonths.length;
    let iNumberOfSelectedMonths = this.m_oAdvanceFilter.selectedMonthsSearchForMonths.length;

    for (let iIndexYear = 0; iIndexYear < iNumberOfSelectedYears; iIndexYear++) {
      for (let iIndexMonth = 0; iIndexMonth < iNumberOfSelectedMonths; iIndexMonth++) {
        let sName = this.m_oAdvanceFilter.selectedYearsSearchForMonths[iIndexYear].toString() + " " + this.m_oAdvanceFilter.selectedMonthsSearchForMonths[iIndexMonth];
        let dateSensingPeriodFrom = new Date();
        let dateSensingPeriodTo = new Date();
        dateSensingPeriodFrom.setFullYear(this.m_oAdvanceFilter.selectedYearsSearchForMonths[iIndexYear]);
        dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(this.m_oAdvanceFilter.selectedMonthsSearchForMonths[iIndexMonth]));
        dateSensingPeriodFrom.setDate(1);
        dateSensingPeriodTo.setFullYear(this.m_oAdvanceFilter.selectedYearsSearchForMonths[iIndexYear]);
        dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(this.m_oAdvanceFilter.selectedMonthsSearchForMonths[iIndexMonth]));
        dateSensingPeriodTo.setDate(this.getMonthDays(this.m_oAdvanceFilter.selectedMonthsSearchForMonths[iIndexMonth], this.m_oAdvanceFilter.selectedYearsSearchForMonths[iIndexYear]));
        let oData = {
          dateSensingPeriodFrom: dateSensingPeriodFrom,
          dateSensingPeriodTo: dateSensingPeriodTo
        };
        this.saveDataInAdvancedFilter(sName, oData);
      }
    }
    return true;
  }

  getSeasonsList() {
    return ["Spring", "Summer", "Autumn", "Winter"];
  }

  removeSavedData() {
    this.m_oAdvanceFilterOptions.savedData = [];
  }

  addFiltersData() {
    let iNumberOfSelectedYears = this.m_oAdvanceFilterOptions.selectedYears.length;
    for (let iIndexYear = 0; iIndexYear < iNumberOfSelectedYears; iIndexYear++) {
      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.selectedSeasons) === false) &&
        (this.m_oAdvanceFilterOptions.selectedSeasons.length > 0)) {
        this.addSeason(this.m_oAdvanceFilterOptions.selectedSeasons, this.m_oAdvanceFilterOptions.selectedYears[iIndexYear], this.m_oAdvanceFilterOptions.savedData);
      }
      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.selectedMonths) === false) &&
        (this.m_oAdvanceFilterOptions.selectedMonths.length > 0)) {
        this.addMonths(this.m_oAdvanceFilterOptions.selectedMonths, this.m_oAdvanceFilterOptions.selectedYears[iIndexYear], this.m_oAdvanceFilterOptions.savedData);
      }

      if ((FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.selectedMonths) === false) &&
        (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.selectedDays) === false) &&
        (this.m_oAdvanceFilterOptions.selectedDays.length > 0)) {
        this.addFilterPeriods(this.m_oAdvanceFilterOptions.selectedMonths, this.m_oAdvanceFilterOptions.selectedDays,
          this.m_oAdvanceFilterOptions.selectedYears[iIndexYear], this.m_oAdvanceFilterOptions.savedData);
      }
    }
  }

  addMonths(asSelectedMonths: Array<string>, iYear: any, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedMonths) || FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false;
    }

    let iNumberOfSelectedMonths = asSelectedMonths.length;
    for (let iIndexMonth = 0; iIndexMonth < iNumberOfSelectedMonths; iIndexMonth++) {
      let sName = iYear.toString() + " " + asSelectedMonths[iIndexMonth];
      let dateSensingPeriodFrom = new Date();
      let dateSensingPeriodTo = new Date();
      dateSensingPeriodFrom.setFullYear(iYear);
      dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexMonth]));
      dateSensingPeriodFrom.setDate(1);

      dateSensingPeriodTo.setFullYear(iYear);
      dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexMonth]));
      dateSensingPeriodTo.setDate(this.getMonthDays(asSelectedMonths[iIndexMonth], iYear));
      let oData = {
        dateSensingPeriodFrom: dateSensingPeriodFrom,
        dateSensingPeriodTo: dateSensingPeriodTo
      };
      this.saveDataInAdvancedFilter(sName, oData, aoSaveData);
    }
    return true;
  }

  addFilterPeriods(asSelectedMonths: Array<string>, asSelectedDays: Array<string>, iYear: number, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedMonths) || FadeoutUtils.utilsIsObjectNullOrUndefined(asSelectedDays) ||
      FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false
    }
    let iNumberOfSelectedMonths = asSelectedMonths.length;
    // let iNumberOfSelectedDays = asSelectedDays.length;
    for (let iIndexSelectedMonth = 0; iIndexSelectedMonth < iNumberOfSelectedMonths; iIndexSelectedMonth++) {
      let aiSelectedDays = this.convertArrayOfStringInArrayOfInteger(asSelectedDays);
      let aaiPeriodsOfTimes = this.getPeriodsOfTimes(aiSelectedDays);
      let iNumberOfPeriodsOfTimes = aaiPeriodsOfTimes.length;
      //TODO END IT
      for (let iIndexPeriodOfTimes = 0; iIndexPeriodOfTimes < iNumberOfPeriodsOfTimes; iIndexPeriodOfTimes++) {
        let sNameChips = "";
        if (aaiPeriodsOfTimes[iIndexPeriodOfTimes].length > 1) {

          let iDayFrom = aaiPeriodsOfTimes[iIndexPeriodOfTimes][0];
          let iDayTo = aaiPeriodsOfTimes[iIndexPeriodOfTimes][aaiPeriodsOfTimes[iIndexPeriodOfTimes].length - 1];

          sNameChips += iDayFrom.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += " - " + iDayTo.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += " " + iYear;

          let dateSensingPeriodFrom = new Date();
          let dateSensingPeriodTo = new Date();

          dateSensingPeriodFrom.setFullYear(iYear);
          dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriodFrom.setDate(iDayFrom);

          // TODO CHECK LEAP YEAS (29 DAYS FEBRUARY)
          dateSensingPeriodTo.setFullYear(iYear);
          dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriodTo.setDate(iDayTo);
          let oData = {
            dateSensingPeriodFrom: dateSensingPeriodFrom,
            dateSensingPeriodTo: dateSensingPeriodTo
          };
          this.saveDataInAdvancedFilter(sNameChips, oData, aoSaveData);

        }
        else {
          let iDay = aaiPeriodsOfTimes[iIndexPeriodOfTimes][0];
          sNameChips += iDay.toString() + "/" + asSelectedMonths[iIndexSelectedMonth].toString();
          sNameChips += "/" + iYear.toString();

          let dateSensingPeriod = new Date();
          dateSensingPeriod.setFullYear(iYear);
          dateSensingPeriod.setMonth(this.convertNameMonthInNumber(asSelectedMonths[iIndexSelectedMonth]));
          dateSensingPeriod.setDate(iDay);

          let oData = {
            dateSensingPeriodFrom: dateSensingPeriod,
            dateSensingPeriodTo: dateSensingPeriod
          };

          this.saveDataInAdvancedFilter(sNameChips, oData, aoSaveData);
        }
      }
    }
    return true;
  }

  savePeriodOfTime(aiPeriodOfTime: Array<number>, sMonth: string, iYear: number) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aiPeriodOfTime)) {
      return false;
    }
    let iNumberOfDays = aiPeriodOfTime.length;
    let iSelectedDayFrom = aiPeriodOfTime[0];
    let iSelectedDayTo = aiPeriodOfTime[iNumberOfDays];
    let sName = "";
    sName += iSelectedDayFrom.toString() + " - " + iSelectedDayTo + "/" + this.convertNameMonthInNumber(sMonth) + "/" + iYear;
    // sName +=  " - " +this.m_oAdvanceFilter.selectedDayTo.toString() + "/" + this.m_oAdvanceFilter.selectedMonthTo.toString();
    // sName += " " + this.m_oAdvanceFilter.selectedYears[iIndexYear].toString();

    let dateSensingPeriodFrom = new Date();
    let dateSensingPeriodTo = new Date();
    dateSensingPeriodFrom.setFullYear(iYear);
    dateSensingPeriodFrom.setMonth(this.convertNameMonthInNumber(sMonth));
    // TODO CHECK LEAP YEAS (29 DAYS FEBRUARY)
    dateSensingPeriodFrom.setDate(iSelectedDayFrom);
    dateSensingPeriodTo.setFullYear(iYear);
    dateSensingPeriodTo.setMonth(this.convertNameMonthInNumber(sMonth));
    dateSensingPeriodTo.setDate(iSelectedDayTo);
    let oData = {
      dateSensingPeriodFrom: dateSensingPeriodFrom,
      dateSensingPeriodTo: dateSensingPeriodTo
    };
    this.saveDataInAdvancedFilter(sName, oData);
    return true;
  }

  convertArrayOfStringInArrayOfInteger(asArray: Array<string>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asArray) === true) {
      return null;
    }
    let iNumberOfElement = asArray.length;
    let aiReturnArray = [];
    for (let iIndexArray = 0; iIndexArray < iNumberOfElement; iIndexArray++) {
      aiReturnArray.push(parseInt(asArray[iIndexArray]));
    }
    return aiReturnArray;
  }

  getPeriodsOfTimes(aiDays: Array<number>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(aiDays)) {
      return null;
    }
    let aaiReturnPeriodsOfTimes = [[]];
    let iIndexReturnPeriodOfTime = 0;

    aiDays.sort();
    let iNumberOfDays = aiDays.length;
    aaiReturnPeriodsOfTimes[iIndexReturnPeriodOfTime].push(aiDays[0]);
    for (let iIndexDay = 1; iIndexDay < iNumberOfDays; iIndexDay++) {
      /*
      * example aiDays = [1,2,7,9]
      * iIndexDay = 1;
      * if( (aiDays[iIndexDay - 1 ] + 1 ) === aiDays[iIndexDay])
      *
      * aiDays[iIndexDay - 1 ] = 1
      *
      * (aiDays[iIndexDay - 1 ] + 1 ) = (1+1)
      *
      * aiDays[iIndexDay] = 2
      *
      * if( (1+1) === 2 ) aiDays[iIndexDay] and aiDays[iIndexDay-1] are a period of times because they are in sequence
      *
      * */
      if ((aiDays[iIndexDay - 1] + 1) === aiDays[iIndexDay]) {
        aaiReturnPeriodsOfTimes[iIndexReturnPeriodOfTime].push(aiDays[iIndexDay]);
      }
      else {
        //Push array
        let aiNewPeriodOfTime = [aiDays[iIndexDay]];
        aaiReturnPeriodsOfTimes.push(aiNewPeriodOfTime);
        iIndexReturnPeriodOfTime++;
      }
    }
    return aaiReturnPeriodsOfTimes;
  }

  addSeason(asSeasonsSelected: Array<string>, iYear: number, aoSaveData: Array<any>) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(asSeasonsSelected) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(iYear) || FadeoutUtils.utilsIsObjectNullOrUndefined(aoSaveData)) {
      return false;
    }
    let iNumberOfSeasonsSelected = asSeasonsSelected.length;
    for (let iIndexSeason = 0; iIndexSeason < iNumberOfSeasonsSelected; iIndexSeason++) {
      let oDataPeriod = null;
      switch (asSeasonsSelected[iIndexSeason].toLowerCase()) {
        case "spring":
          oDataPeriod = this.getPeriodSpring();
          break;
        case "summer":
          oDataPeriod = this.getPeriodSummer();
          break;
        case "autumn":
          oDataPeriod = this.getPeriodAutumn();
          break;
        case "winter":
          oDataPeriod = this.getPeriodWinter();
          break;
      }

      if (asSeasonsSelected[iIndexSeason].toLowerCase() !== "winter") {
        if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodFrom.setYear(iYear);
      }
      else {
        if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodFrom.setYear(iYear - 1);
      }
      if (oDataPeriod !== null) oDataPeriod.dateSensingPeriodTo.setYear(iYear);
      let sName = iYear.toString() + asSeasonsSelected[iIndexSeason];
      this.saveDataInAdvancedFilter(sName, oDataPeriod, aoSaveData);
    }
    return true;
  }

  cleanAdvanceFilters() {
    this.m_oAdvanceFilter.selectedSeasonYears = [];
    this.m_oAdvanceFilter.selectedYears = [];
    this.m_oAdvanceFilter.selectedDayFrom = "";
    this.m_oAdvanceFilter.selectedDayTo = "";
    this.m_oAdvanceFilter.selectedMonthFrom = "";
    this.m_oAdvanceFilter.selectedMonthTo = "";
    this.m_oAdvanceFilter.selectedYearsSearchForMonths = [];
    this.m_oAdvanceFilter.selectedMonthsSearchForMonths = [];
  }

  removeAllAdvanceSavedFilters() {
    this.m_oAdvanceFilter.savedData = [];
  }

  isEmptyListOfFilters() {
    return (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions) === true || FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oAdvanceFilterOptions.savedData) === true || this.m_oAdvanceFilterOptions.savedData.length === 0);
  }

  /********** Selection Change Handlers **********/
  getSelectedYears(oEvent) {
    if (oEvent.value) {
      this.m_oAdvanceFilterOptions.selectedYears = oEvent.value;
    }
  }

  getSelectedSeasons(oEvent) {
    if (oEvent.value) {
      this.m_oAdvanceFilterOptions.selectedSeasons = oEvent.value;
    }
  }

  getSelectedMonths(oEvent) {
    if (oEvent.value) {
      this.m_oAdvanceFilterOptions.selectedMonths = oEvent.value;
    }
  }

  getSelectedDays(oEvent) {
    if (oEvent.value) {
      this.m_oAdvanceFilterOptions.selectedDays = oEvent.value;
    }
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
