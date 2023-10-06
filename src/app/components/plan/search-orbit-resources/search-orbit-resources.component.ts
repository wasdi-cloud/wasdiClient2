import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

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
export class SearchOrbitResourcesComponent implements OnChanges {
  @Input() m_aoSatelliteResources: Array<any>;
  treeControl: NestedTreeControl<SatelliteNode>;
  dataSource: MatTreeNestedDataSource<SatelliteNode>;
  constructor() {
    this.treeControl = new NestedTreeControl<SatelliteNode>(node => {
      return (node.satelliteSensors) ? node.satelliteSensors : node.sensorModes;
    });
    this.dataSource = new MatTreeNestedDataSource();
  }


  ngOnChanges() {
    console.log(this.m_aoSatelliteResources);
    this.dataSource.data = this.m_aoSatelliteResources;
  }
 

  hasChild(_: number, node: SatelliteNode) {
    return (node.satelliteSensors) ?
      !!node.satelliteSensors && node.satelliteSensors.length > 0 :
      !!node.sensorModes && node.sensorModes.length > 0;
  }

}
