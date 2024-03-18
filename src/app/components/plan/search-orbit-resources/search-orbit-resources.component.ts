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
  name: string;
  sensorModes?: Array<any>;
  sNodeName?: string;
  parent?: { name: string | null };
  grandparent?: { name: string }
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
    console.log(this.m_aoSatelliteResources)
  }


  ngOnChanges() {
    // this.dataSource.data = this.setDisabledAllOpportunities(this.setParentProperty(this.m_aoSatelliteResources));
    this.dataSource.data = this.setParentProperty(this.m_aoSatelliteResources);
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

  /**
   * Identifies which nodes have child nodes for displaying in the Mat-Nested-Tree
   * @param iNumber 
   * @param oNode 
   * @returns {boolean}
   */
  hasChild(_: number, oNode: SatelliteNode): boolean {
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


  // /** Toggle the node selection. Select/deselect all the aoDescendants oNode */
  // nodeSelectionToggle(oNode: SatelliteNode): void {
  //   this.checklistSelection.toggle(oNode);
  //   const aoDescendants = this.treeControl.getDescendants(oNode);
  //   if (this.checklistSelection.isSelected(oNode)) {
  //     this.checklistSelection.select(...aoDescendants);
  //     this.addNode(oNode);
  //   } else {
  //     this.checklistSelection.deselect(...aoDescendants);
  //     this.removeNode(oNode)
  //   }
  //   //Emit the Selected Satellite Change: 
  //   this.emitSatelliteSelection();
  //   this.emitDateChange();
  // }


  /********** Selected Nodes Array Handlers **********/

  /**
   * Add Node to selected nodes array
   * @param oNode 
   * @returns {void}
   */
  addNode(oNode: SatelliteNode): void {
    //Find Node in Satellite Sensors and Enable:
    if (oNode.satelliteSensors) {
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oNode.satelliteName) {
          oSatellite.enable = true;
        }
      })
    }
    //If Node is the first nested child: 
    if (oNode.sensorModes && !oNode.grandparent) {
      //Find Node Parent 
      let oParentNode = this.m_aoSatelliteResources.find(oSatellite => oSatellite.satelliteName === oNode.parent.name);

      //Is Node Parent Already Enabled?
      if (oParentNode.enable === false) {
        //If Not -> Enable Node in 
        oParentNode.enable = true;
      }
      // Enable Node in SatelliteResources Array
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oNode.parent.name) {
          oSatellite.satelliteSensors.forEach(oSensor => {
            if (oSensor.description === oNode.description) {
              oSensor.enable = true;
            }
          })
        }
      });
    }

    //If Node is the second nested child: 
    if (oNode.grandparent) {
      //Find Grandparent Node and enable (Parent Node)
      let oGrandParentNode = this.m_aoSatelliteResources.find(oSatellite => oSatellite.satelliteName === oNode.grandparent.name);
      //Find Parent Node and enable (first nested child)
      let oParentNode
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oGrandParentNode.satelliteName) {
          oSatellite.satelliteSensors.forEach(oSensor => {
            if (oSensor.description === oNode.parent.name) {
              oParentNode = oSensor;
            }
          });
        }
      });

      //If Grandparent Node not enabled, enable it: 
      if (oGrandParentNode.enable === false) {
        oGrandParentNode.enable = true;
      }

      //If Parent Node not enabled, enable it: 
      if (oParentNode.enable === false) {
        oParentNode.enable = true;
      }
      //Find Parent Node in SatelliteSensors of Grandparent node:
      this.m_aoSatelliteResources.forEach(oSatellite => {
        oSatellite.satelliteSensors.forEach(oSensor => {
          if (oSensor.description === oParentNode.description) {
            oSensor.sensorModes.forEach(oMode => {
              if (oMode.name === oNode.name) {
                oMode.enable = true;
              }
            })
          }
        })
      })
    }
  }

  /**
   * Remove a node from selected nodes array
   * @param oNode 
   * @returns {void}
   */
  removeNode(oNode: SatelliteNode): void {
    //Disable Node: 
    if (oNode.satelliteSensors) {
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oNode.satelliteName) {
          oSatellite.enable = false;
        }
      })
    }
    //If Node is the first nested child: 
    if (oNode.sensorModes && !oNode.grandparent) {
      let oParentNode = this.m_aoSatelliteResources.find(oSatellite => oSatellite.satelliteName === oNode.parent.name);

      //Is Node Parent Enabled?
      if (oParentNode.enable === true) {
        //If Not -> disable Node in 
        oParentNode.enable = false;
      }
      // Disable Node in SatelliteResources Array
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oNode.parent.name) {
          oSatellite.satelliteSensors.forEach(oSensor => {
            if (oSensor.description === oNode.description) {
              oSensor.enable = false;
            }
          })
        }
      });
    }

    //If Node is the second nested child: 
    if (oNode.grandparent) {
      //Find Grandparent Node and enable (Parent Node)
      let oGrandParentNode = this.m_aoSatelliteResources.find(oSatellite => oSatellite.satelliteName === oNode.grandparent.name);
      //Find Parent Node and enable (first nested child)
      let oParentNode
      this.m_aoSatelliteResources.forEach(oSatellite => {
        if (oSatellite.satelliteName === oGrandParentNode.satelliteName) {
          oSatellite.satelliteSensors.forEach(oSensor => {
            if (oSensor.description === oNode.parent.name) {
              oParentNode = oSensor;
            }
          });
        }
      });

      //If Grandparent Node not enabled, enable it: 
      if (oGrandParentNode.enable === true) {
        oGrandParentNode.enable = false;
      }

      //If Parent Node not enabled, enable it: 
      if (oParentNode.enable === true) {
        oParentNode.enable = false;
      }
      //Find Parent Node in SatelliteSensors of Grandparent node:
      this.m_aoSatelliteResources.forEach(oSatellite => {
        oSatellite.satelliteSensors.forEach(oSensor => {
          if (oSensor.description === oParentNode.description) {
            oSensor.sensorModes.forEach(oMode => {
              if (oMode.name === oNode.name) {
                oMode.enable = false;
              }
            })
          }
        })
      })
    }
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
}
