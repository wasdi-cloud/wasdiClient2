import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

//Angular Material Imports:
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

//Service Improts: 
import { MapService } from 'src/app/services/map.service';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


// Create Class for Search Result Node to be read by Mat-Tree
export class SearchResultNode {
  acquisitionStartTime: string;
  acquisitionEndTim: string;
  directions: any;
  left: Array<any>;
  right: Array<any>;
  swathName: string;
  swathFootPrint: string;
}

@Component({
  selector: 'app-search-orbit-results',
  templateUrl: './search-orbit-results.component.html',
  styleUrls: ['./search-orbit-results.component.css']
})

export class SearchOrbitResultsComponent implements OnChanges {
  @Input() m_aoSearchOrbits: Array<any>;
  @Output() m_oBackToFiltersEmit: EventEmitter<any> = new EventEmitter();

  faBack = faArrowLeft;

  treeControl: NestedTreeControl<SearchResultNode>;
  dataSource: MatTreeNestedDataSource<SearchResultNode>;

  m_bSearchResultsReceived: boolean = false;

  m_aoDisplayedProducts: Array<any> = [];

  m_aoSelectedOrbits: Array<any> = [];

  constructor(
    private m_oMapService: MapService
  ) { }

  ngOnChanges(): void {
    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_aoSearchOrbits)) {
      if (this.m_aoSearchOrbits.length > 0) {
        this.m_bSearchResultsReceived = true;
      }
    }
  }

  /**
   * Evaluate if the inputted SearchResultNode has children (nested nodes)
   * @param iIndex
   * @param oNode 
   * @returns {boolean}
   */
  hasChild(iIndex: number, oNode: SearchResultNode): boolean {
    if (oNode.directions) {
      return !!oNode.directions && oNode.directions.length > 0
    } else if (oNode.left) {
      return !!oNode.left && oNode.left.length > 0
    } else if (oNode.right) {
      return !!oNode.right && oNode.right.length > 0
    }
    return false;
  }

  toggleSelectedOrbit(oNode: SearchResultNode) {
    let sBoundingBox = oNode.swathFootPrint.substring(9, oNode.swathFootPrint.length - 3)
    let aBoundingBox = sBoundingBox.split(",");

    let bIsDisplayed: boolean = false;
    let oFoundNode: any;
    let iFoundIndex: number;

    //Find node in Displayed Products Array
    this.m_aoDisplayedProducts.forEach((oProduct, iIndex) => {
      if (oProduct.name === oNode.swathName) {
        bIsDisplayed = true;
        oFoundNode = oProduct;
        iFoundIndex = iIndex;
      }
    })

    if (bIsDisplayed === false) {
      let aasPolygon = this.getPolygonToBounds(aBoundingBox)
      let oRectangle = this.m_oMapService.addRectangleByBoundsArrayOnMap(aasPolygon, 'yellow', this.m_aoDisplayedProducts.length)
      this.m_aoDisplayedProducts.push({
        name: oNode.swathName,
        boundingBox: aBoundingBox,
        rectangle: oRectangle
      })
    } else {
      //Remove Found Node from displayed Nodes Array: 
      this.m_aoDisplayedProducts.splice(iFoundIndex, 1);
      //Remove Rectangle from the Map: 
      this.m_oMapService.removeLayerFromMap(oFoundNode.rectangle);
    }
  }

  getPolygonToBounds(aBoundingBox) {
    let aasNewPolygon = [];
    for (let iIndexBounds = 0; iIndexBounds < aBoundingBox.length; iIndexBounds++) {
      let aBounds = aBoundingBox[iIndexBounds];
      let aNewBounds = aBounds.split(" ");

      var oLatLonArray = [];

      try {
        oLatLonArray[0] = JSON.parse(aNewBounds[1]); //Lat
        oLatLonArray[1] = JSON.parse(aNewBounds[0]); //Lon
      } catch (err) {
        console.log("Function polygonToBounds: Error in parse operation");
        return [];
      }
      aasNewPolygon.push(oLatLonArray);
    }
    return aasNewPolygon;
  }

  navigateToFilters() {
    this.m_oBackToFiltersEmit.emit(true);
  }

  openNode(oNode: any) {
    oNode.isOpen = !oNode.isOpen
  }
}
