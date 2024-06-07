import { Component, EventEmitter, Input, OnInit, Output, AfterViewChecked } from '@angular/core';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-orbit-resources',
  templateUrl: './search-orbit-resources.component.html',
  styleUrls: ['./search-orbit-resources.component.css']
})
export class SearchOrbitResourcesComponent implements OnInit, AfterViewChecked {
  @Input() m_aoSatelliteResources: Array<any>;
  @Input() m_oSelectedArea: any;
  @Input() m_oAcquisitionStartTime: any;
  @Input() m_oAcquisitionEndTime: any;
  @Input() m_aoSelectedNodes: Array<any> = [];

  @Output() m_oDateSelection: EventEmitter<any> = new EventEmitter();
  @Output() m_oSatelliteSelection: EventEmitter<any> = new EventEmitter();
  @Output() m_oExecuteSearch: EventEmitter<any> = new EventEmitter();


  m_oStartDate: any;
  m_oEndDate: any;

  m_oOrbitSearch = {
    acquisitionStartTime: null,
    acquisitionEndTime: null,
    lookingType: "LEFT",
    viewAngle: {
      nearAngle: "",
      farAngle: ""
    },
    swathSize: {
      length: "",
      width: ""
    }
  }

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTranslate: TranslateService
  ) { }

  ngOnInit(): void {
    //Set default Date Data: 
    this.setDefaultDateData();
  }

  ngAfterViewChecked() {
    this.setParentProperty(this.m_aoSatelliteResources);
  }

  /**
   * Sets a parent property for each node to be read when preparing the Selected Nodes for the Search Orbit parent
   * @param oData 
   * @param oParent 
   * @returns {Array<any>}
   */
  setParentProperty(oData, oParent = null): Array<any> {
    oData.forEach(item => {
      if (oParent !== null) {
        if (oParent.satelliteName) {
          item.parent = { name: oParent.satelliteName };
        }
        if (oParent.description) {
          item.parent = { name: oParent.description };
          item.grandparent = { name: oParent.parent.name }
        }
      } else {
        item.parent = null;
      }
      if (item.satelliteSensors) {
        this.setParentProperty(item.satelliteSensors, item);
      }

      if (item.sensorModes) {
        this.setParentProperty(item.sensorModes, item)
      }
    });
    return oData;
  }

  setDefaultDateData() {
    this.m_oStartDate = new Date();
    this.m_oEndDate = new Date();
    this.m_oEndDate.setDate(this.m_oEndDate.getDate() + 7);
    this.m_oStartDate = this.m_oStartDate.toISOString().slice(0, 10);
    this.m_oEndDate = this.m_oEndDate.toISOString().slice(0, 10);
  }

  /********** Event Emitters For Input Changes **********/

  emitDateChange() {
    //Revert Acquisiiton Dates to long form date timestamp 
    this.m_oAcquisitionStartTime = new Date(this.m_oStartDate);
    this.m_oAcquisitionEndTime = new Date(this.m_oEndDate);

    this.m_oDateSelection.emit({
      acquisitionStartTime: this.m_oAcquisitionStartTime,
      acquisitionEndTime: this.m_oAcquisitionEndTime
    })
  }

  emitSatelliteSelection() {
    let aoArrayToEmit = this.m_aoSatelliteResources
    this.m_oSatelliteSelection.emit(aoArrayToEmit);
  }

  /**
   * Handle changes in the satellite selection from the PLAN TREE Component 
   * @param oEvent 
   */
  getSatelliteSelection(oEvent) {
    this.emitSatelliteSelection();
  }

  getDateSelection(oEvent) {
    if (oEvent.label === 'From') {
      this.m_oStartDate = oEvent.event.target.value;
    } else if (oEvent.label === 'To') {
      this.m_oEndDate = oEvent.event.target.value;
    }

    this.emitDateChange();
  }

  executeSearch() {
    // Catch to ensure the date is recorded in the parent
    this.emitDateChange();
    this.m_oExecuteSearch.emit(true);
  }

  clearFilters() { }

}
