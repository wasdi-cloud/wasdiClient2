import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrls: ['./plan-tree.component.css']
})
export class PlanTreeComponent {
  @Input() m_oSatellite: any = null;
  @Output() m_oSatelliteChange: EventEmitter<any> = new EventEmitter();
  @Output() m_oProductSelection: EventEmitter<any> = new EventEmitter();

  m_bIsOpen: boolean = false;
  m_bIsOpenChild: boolean = false;
  m_bShowChildren: boolean = false;

  m_oOpenParent: any = null;

  constructor() {
  }
  openSatelliteSensors() {
    this.m_bIsOpen = !this.m_bIsOpen;
  }

  openSensorModes(oSensor?: any) {
    if (oSensor) {
      this.m_oOpenParent = oSensor;
    }
    this.m_bIsOpenChild = !this.m_bIsOpenChild
  }

  toggleNodeSelection(oSelectedNode: any) {
    let oParentNode = this.findParentNodes(oSelectedNode);
    oSelectedNode.selected = !oSelectedNode.selected;
    oSelectedNode.enable = !oSelectedNode.enable;

    // Select/de-select children based on parent
    this.selectAllChildren(oSelectedNode);
    // If the selected node is the highest node(root node) select it an selected all its children
    if (oSelectedNode.satelliteName === this.m_oSatellite.satelliteName) {
      this.m_oSatellite.satelliteSensors.forEach(oSensor => {
        oSensor.selected = oSelectedNode.selected;
        oSensor.enable = oSelectedNode.enable
        oSensor.sensorModes.forEach(oSensorMode => {
          oSensorMode.selected = oSelectedNode.selected;
          oSensorMode.enable = oSelectedNode.enable;
        });
      })

    }

    // If the ultimate parent is the root node - check if it has selected children
    if (oParentNode.satelliteName) {
      let oHasSelectedChildren = this.hasSelectedChildren(oParentNode)
      //If all children are UNSELECTED completely unmark parent
      if (!oHasSelectedChildren.hasSelectedChild && !oHasSelectedChildren.allChildrenSelected) {
        this.m_oSatellite.indeterminate = false;
        this.m_oSatellite.selected = false;
        // this.selectAllChildren(oSelectedNode);
        // If has selected child(ren), but not all children are selected
      } else if (oHasSelectedChildren.hasSelectedChild && !oHasSelectedChildren.allChildrenSelected) {
        this.m_oSatellite.indeterminate = true;
        this.m_oSatellite.enable = true;
        this.m_oSatellite.selected = false;
        // If all children are selected (hasSelectedChild && allChildrenSelected)
      } else {
        this.m_oSatellite.indeterminate = false;
        this.m_oSatellite.selected = true;
      }
    }

    // If the node is the lowest child (i.e., has Parent AND Grandparent)
    if (oParentNode.parent) {
      // this.m_oSatellite.indeterminate = oSelectedNode.selected;
      this.m_oSatellite.satelliteSensors.forEach(oSensor => {
        if (oSensor.description === oParentNode.parent.description) {
          // Check if the parent node has checked children
          let bParentCheckedChildren = this.hasSelectedChildren(oParentNode.parent);
          // If now all the parent's children are selected 
          if (bParentCheckedChildren.allChildrenSelected) {
            oSensor.indeterminate = false;
            oSensor.selected = true;
            oSensor.enable = true;
            // If the parent has NO SELECTED CHILDREN
          } else if (bParentCheckedChildren.hasSelectedChild && !bParentCheckedChildren.allChildrenSelected) {
            oSensor.indeterminate = true;
            oSensor.enable = true;
            oSensor.selected = false
          } else {
            oSensor.indeterminate = false;
            oSensor.selected = false;
          }
          // oSensor.sensorModes.forEach(oSensorMode => {
          // })

          let bGrandparentCheckedChildren = this.hasSelectedChildren(oParentNode.grandparent);

          if (bGrandparentCheckedChildren.hasSelectedChild) {
            this.m_oSatellite.indeterminate = true;
            this.m_oSatellite.enable = true
          } else if (bGrandparentCheckedChildren.allChildrenSelected) {
            this.m_oSatellite.indeterminate = false;
            this.m_oSatellite.selected = true;
            this.m_oSatellite.enable = true;
          } else {
            this.m_oSatellite.indeterminate = false;
            this.m_oSatellite.selected = false;
          }
        }
      })
    }
    this.m_oSatelliteChange.emit(this.m_oSatellite);
  }

  /**
   * Finds the parent and grandparent nodes of the inputted Node and returns with complete node information. 
   */
  findParentNodes(oNode: any) {
    let oParent: any = {
      parent: null,
      grandparent: null
    };
    if (oNode.parent) {
      if (oNode.parent.name === this.m_oSatellite.satelliteName) {
        oParent = this.m_oSatellite;
      } else if (oNode.grandparent.name === this.m_oSatellite.satelliteName) {
        oParent.grandparent = this.m_oSatellite;
        this.m_oSatellite.satelliteSensors.forEach(oSensor => {
          if (oSensor.description === oNode.parent.name) {
            oParent.parent = oSensor;
          }
        })
      }
    }
    return oParent;
  }


  /**
   * Checks if the inputted Node has child nodes (satelliteSensors or sensorModes)
   * @param oNode 
   */
  hasChildren(oNode: any): boolean {
    if (oNode.satelliteSensors || oNode.sensorModes) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if the selected child is the ONLY child selected and if all children are selected
   * @param oNode 
   * @param oSelectedNode 
   * @returns boolean
   */
  hasSelectedChildren(oNode) {
    let bHasSelectedChild: any = {
      hasSelectedChild: false,
      allChildrenSelected: true
    };
    if (oNode.satelliteSensors) {
      oNode.satelliteSensors.forEach(oSensor => {
        if (oSensor.selected === true) {
          bHasSelectedChild.hasSelectedChild = true;
        }
        if (!oSensor.selected) {
          bHasSelectedChild.allChildrenSelected = false;
        }
        // oSensor.sensorModes.forEach(oSensorMode => {
        //   if (oSensorMode.selected === true) {
        //     bHasSelectedChild.hasSelectedChild = true;
        //   }
        //   if (oSensorMode.selected === false) {
        //     bHasSelectedChild.allChildrenSelected = false;
        //   }
        // })

      })
      // } else if (oNode.sensorModes) {
      //   oNode.sensorModes.forEach(oSensor => {
      //     if (oSensor.selected === true) {
      //       bHasSelectedChild.hasSelectedChild = true;
      //     }
      //     if (oSensor.selected === false) {
      //       bHasSelectedChild.allChildrenSelected = false;
      //     }
      //   })
    }

    return bHasSelectedChild
  }

  /**
   * Handle when a node containing satelliteSensors OR sensorModes is selected
   * @param oNode 
   */
  selectAllChildren(oNode: any): void {
    if (oNode.satelliteSensors) {
      oNode.satelliteSensors.forEach(oSensor => {
        //selected or disable node based on the parent:
        oSensor.selected = oNode.selected;
      })
    }

    if (oNode.sensorModes) {
      oNode.sensorModes.forEach(oSensorMode => {
        //selected or disable node based on the parent:
        oSensorMode.selected = oNode.selected
      })
    }
  }

}
