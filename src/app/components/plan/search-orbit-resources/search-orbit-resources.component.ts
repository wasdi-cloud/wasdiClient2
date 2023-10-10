import { Component, EventEmitter, Input, OnInit, OnChanges, Output } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * Node for Satellite Parent (e.g., Cosmo-SkyMed 1):
 */
export class SatelliteNode {
  satelliteName: string;
  satelliteSensors: Array<any>;
  description: string;
  enable: boolean;
  sensorModes: Array<any>;
  name: string;
}

@Component({
  selector: 'app-search-orbit-resources',
  templateUrl: './search-orbit-resources.component.html',
  styleUrls: ['./search-orbit-resources.component.css']
})
export class SearchOrbitResourcesComponent implements OnInit, OnChanges {
  @Input() m_aoSatelliteResources: Array<any>;
  @Input() m_oAcquisitionStartTime: any;
  @Input() m_oAcquisitionEndTime: any;

  @Output() m_oDateSelection: EventEmitter<any> = new EventEmitter();
  @Output() m_oSatelliteSelection: EventEmitter<any> = new EventEmitter();

  treeControl: NestedTreeControl<SatelliteNode>;
  dataSource: MatTreeNestedDataSource<SatelliteNode>;

  checklistSelection = new SelectionModel<SatelliteNode>(true /* Multiple */);

  m_aoSelectedNodes: Array<any> = [];

  m_oStartDate: any;
  m_oEndDate: any;

  constructor() {
    this.treeControl = new NestedTreeControl<SatelliteNode>(oNode => {
      return (oNode.satelliteSensors) ? oNode.satelliteSensors : oNode.sensorModes;
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit(): void {
    //Set default Date Data: 
    this.setDefaultDateData();
  }


  ngOnChanges() {
    this.dataSource.data = this.m_aoSatelliteResources;
  }


  hasChild(_: number, oNode: SatelliteNode) {
    return (oNode.satelliteSensors) ?
      !!oNode.satelliteSensors && oNode.satelliteSensors.length > 0 :
      !!oNode.sensorModes && oNode.sensorModes.length > 0;
  }

  setDefaultDateData() {
    this.m_oStartDate = new Date();
    this.m_oEndDate = new Date();
    this.m_oEndDate.setDate(this.m_oEndDate.getDate() + 7);
    this.m_oStartDate = this.m_oStartDate.toISOString().slice(0, 10);
    this.m_oEndDate = this.m_oEndDate.toISOString().slice(0, 10);
  }

  /** Whether all the descendants of the oNode are selected */
  descendantsAllSelected(oNode: SatelliteNode): boolean {
    const aoDescendants = this.treeControl.getDescendants(oNode);
    return aoDescendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the aoDescendants are selected */
  descendantsPartiallySelected(oNode: SatelliteNode): boolean {
    const aoDescendants = this.treeControl.getDescendants(oNode);
    const aoResults = aoDescendants.some(child => this.checklistSelection.isSelected(child));
    return aoResults && !this.descendantsAllSelected(oNode);
  }

  /** Toggle the to-do item selection. Select/deselect all the aoDescendants oNode */
  todoItemSelectionToggle(oNode: SatelliteNode): void {
    this.checklistSelection.toggle(oNode);
    const aoDescendants = this.treeControl.getDescendants(oNode);
    if (this.checklistSelection.isSelected(oNode)) {
      this.checklistSelection.select(...aoDescendants);
      this.addNode(oNode);
    } else {
      this.checklistSelection.deselect(...aoDescendants);
      this.removeNode(oNode)
    }
    //Emit the Selected Satellite Change: 
    this.emitSatelliteSelection();
    this.emitDateChange();
  }

  addNode(oNode: SatelliteNode) {
    this.m_aoSelectedNodes.push(oNode);
  }

  removeNode(oNode: SatelliteNode) {
    if (oNode.satelliteName) {
      this.m_aoSelectedNodes = this.m_aoSelectedNodes.filter(oResource => oResource.satelliteName !== oNode.satelliteName);
    }

    if (oNode.description) {
      this.m_aoSelectedNodes = this.m_aoSelectedNodes.filter(oResource => oResource.description !== oNode.description);
    }

  }

  /********** Event Emitters For Input Changes **********/

  emitDateChange() {
    //Revert Acquisiiton Dates to long form date timestamp 
    this.m_oAcquisitionStartTime = new Date(this.m_oStartDate);
    this.m_oAcquisitionEndTime = new Date(this.m_oEndDate);

    console.log({
      acquisitionStartTime: this.m_oAcquisitionStartTime,
      acquisitionEndTime: this.m_oAcquisitionEndTime
    })

    this.m_oDateSelection.emit({
      acquisitionStartTime: this.m_oAcquisitionStartTime,
      acquisitionEndTime: this.m_oAcquisitionEndTime
    })

  }

  emitSatelliteSelection() {
    this.m_oSatelliteSelection.emit(this.m_aoSelectedNodes);
  }
}
