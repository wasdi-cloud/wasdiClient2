import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

export class SearchResultNode {
  acquisitionStartTime: string;
  acquisitionEndTim: string;
  directions: any;
  left: Array<any>;
  right: Array<any>;
}

@Component({
  selector: 'app-search-orbit-results',
  templateUrl: './search-orbit-results.component.html',
  styleUrls: ['./search-orbit-results.component.css']
})

export class SearchOrbitResultsComponent implements OnInit {
  @Input() m_aoSearchOrbits: Array<any>;
  @Output() m_aoSelectedOrbits: EventEmitter<any> = new EventEmitter();

  treeControl: NestedTreeControl<SearchResultNode>;
  dataSource: MatTreeNestedDataSource<SearchResultNode>;

  constructor() {
    this.treeControl = new NestedTreeControl<SearchResultNode>(oNode => {
      if (oNode.directions) {
        return oNode.directions
      } else if (oNode.left) {
        return oNode.left
      } else {
        return oNode.right
      }
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit(): void { }

  ngOnChanges(): void {
    this.dataSource.data = this.m_aoSearchOrbits;
  }

  hasChild(_: number, oNode: SearchResultNode): boolean {
    if (oNode.directions) {
      return !!oNode.directions && oNode.directions.length > 0
    } else if (oNode.left) {
      return !!oNode.left && oNode.left.length > 0
    } else if (oNode.right) {
      return !!oNode.right && oNode.right.length > 0
    }
    return false;
  }

  onClick(oNode) {
    console.log(oNode)
  }

}
