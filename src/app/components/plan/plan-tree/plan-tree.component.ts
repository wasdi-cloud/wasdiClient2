import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-plan-tree',
  templateUrl: './plan-tree.component.html',
  styleUrls: ['./plan-tree.component.css']
})
export class PlanTreeComponent {
  @Input() m_oSatellite: any = null;
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

    oSelectedNode.enable = !oSelectedNode.enable;
    // If the selected node is the highest node(root node) select it an enable all its children
    if (oSelectedNode.satelliteName === this.m_oSatellite.satelliteName) {

      this.m_oSatellite.satelliteSensors.forEach(oSensor => {
        oSensor.enable = oSelectedNode.enable;
        oSensor.sensorModes.forEach(oSensorMode => {
          oSensorMode.enable = oSelectedNode.enable
        });
      })

    }

    // If the ultimate parent is the root node - check if it has selected children
    if (oParentNode.satelliteName) {
      let oHasSelectedChildren = this.hasSelectedChildren(oParentNode)
      console.log(oParentNode)
      //If all children are UNSELECTED completely unmark parent
      if (!oHasSelectedChildren.hasSelectedChild) {
        this.m_oSatellite.indeterminate = false;
        this.m_oSatellite.enable = false;
        this.selectAllChildren(oSelectedNode);
        // If has selected child(ren), but not all children are selected
      } else if (oHasSelectedChildren.hasSelectedChild && !oHasSelectedChildren.allChildrenSelected) {
        this.m_oSatellite.indeterminate = true;
        this.m_oSatellite.enable = false;
        this.selectAllChildren(oSelectedNode);
        // If all children are selected (hasSelectedChild && allChildrenSelected)
      } else if (oHasSelectedChildren.allChildrenSelected) {
        this.m_oSatellite.indeterminate = false;
        this.m_oSatellite.enable = true;
      } else {
        // this.m_oSatellite.indeterminate = false;
        // this.m_oSatellite.enable = true;
      }
    }

    // If the node is the lowest child (i.e., has Parent AND Grandparent)
    if (oParentNode.parent) {
      // this.m_oSatellite.indeterminate = oSelectedNode.enable;
      this.m_oSatellite.satelliteSensors.forEach(oSensor => {
        if (oSensor.description === oParentNode.parent.description) {
          // Check if the parent node has checked children
          let bParentCheckedChildren = this.hasSelectedChildren(oParentNode.parent);
          // If now all the parent's children are selected 
          if (bParentCheckedChildren.allChildrenSelected) {
            oSensor.indeterminate = false;
            oSensor.enable = true;
            // If the parent has NO SELECTED CHILDREN
          } else if (bParentCheckedChildren.hasSelectedChild && !bParentCheckedChildren.allChildrenSelected) {
            oSensor.indeterminate = true;
            oSensor.enable = false
          } else {
            oSensor.indeterminate = false;
            oSensor.enable = false;
          }
          // oSensor.sensorModes.forEach(oSensorMode => {
          // })

          let bGrandparentCheckedChildren = this.hasSelectedChildren(oParentNode.grandparent);

          if (bGrandparentCheckedChildren.hasSelectedChild) {
            this.m_oSatellite.indeterminate = true;
          } else if (bGrandparentCheckedChildren.allChildrenSelected) {
            this.m_oSatellite.indeterminate = false;
            this.m_oSatellite.enable = true;
          } else {
            this.m_oSatellite.indeterminate = false;
            this.m_oSatellite.enable = false;
          }
        }
      })
    }
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
        if (oSensor.enable === true) {
          bHasSelectedChild.hasSelectedChild = true;
        }
        if (oSensor.enable === false) {
          bHasSelectedChild.allChildrenSelected = false;
        }
        oSensor.sensorModes.forEach(oSensorMode => {
          if (oSensorMode.enable === true) {
            bHasSelectedChild.hasSelectedChild = true;
          }
          if (oSensorMode.enable === false) {
            bHasSelectedChild.allChildrenSelected = false;
          }
        })

      })
    }
    if (oNode.sensorModes) {
      oNode.sensorModes.forEach(oSensor => {
        if (oSensor.enable === true) {
          bHasSelectedChild.hasSelectedChild = true;
        }
        if (oSensor.enable === false) {
          bHasSelectedChild.allChildrenSelected = false;
        }
      })
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
        //Enable or disable node based on the parent:
        oSensor.enable = oNode.enable;
      })
    }

    if (oNode.sensorModes) {
      oNode.sensorModes.forEach(oSensorMode => {
        //Enable or disable node based on the parent:
        oSensorMode.enable = oNode.enable
      })
    }
  }

}
