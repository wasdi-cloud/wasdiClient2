import { Component, Input } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';
import { Band } from 'src/app/shared/models/band.model';

//Angular Material Imports:
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface ProductNode extends Product {
  selected?: boolean;
  indeterminate?: boolean;
}
const TREE_DATA = [
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 5566,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 5566
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "23.000074,97.999985,23.000074,98.999992,24.000080,98.999992,24.000080,97.999985,23.000074,97.999985",
    "description": "New Product Description",
    "fileName": "MY_99_2021-12-10_13_6.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "MY_99_2021-12-10_13_6",
    "productFriendlyName": "New Product Name",
    "style": "active_fire"
  },
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 5566,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 5566
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "23.000004,97.999977,23.000004,98.999977,24.000010,98.999977,24.000010,97.999977,23.000004,97.999977",
    "description": null,
    "fileName": "MY_99_2021-12-16_13_6.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "MY_99_2021-12-16_13_6",
    "productFriendlyName": null,
    "style": null
  },
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 5566,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 5566
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "23.000065,97.999931,23.000065,98.999931,24.000071,98.999931,24.000071,97.999931,23.000065,97.999931",
    "description": null,
    "fileName": "MY_99_2021-12-10_13_6_flood.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "MY_99_2021-12-10_13_6_flood.tif",
    "productFriendlyName": "test1",
    "style": "flood_on_off"
  },
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 5566,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 5566
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "23.000074,97.999985,23.000074,98.999992,24.000080,98.999992,24.000080,97.999985,23.000074,97.999985",
    "description": "test11",
    "fileName": "FloodMap.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "FloodMap.tif",
    "productFriendlyName": "a",
    "style": "DDS_FLOODED_AREAS"
  },
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 77924,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 44528
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "23.750040,69.999863,23.750040,77.999901,37.750103,77.999901,37.750103,69.999863,23.750040,69.999863",
    "description": "test",
    "fileName": "PAK_2022-08-31_flood.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "PAK_2022-08-31_flood",
    "productFriendlyName": "PAK_2022-08-31_flood",
    "style": "flood_on_off"
  },
  {
    "bandsGroups": {
      "bands": [
        {
          "geoserverBoundingBox": null,
          "geoserverUrl": null,
          "height": 3600,
          "layerId": null,
          "name": "band_1",
          "published": false,
          "width": 3600
        }
      ],
      "nodeName": "Bands"
    },
    "bbox": "33,-2,33,-1,34,-1,34,-2,33,-2",
    "description": null,
    "fileName": "Copernicus_DSM_COG_10_N33_00_W002_00_DEM.tif",
    "metadata": null,
    "metadataFileCreated": false,
    "metadataFileReference": null,
    "name": "Copernicus_DSM_COG_10_N33_00_W002_00_DEM.tif",
    "productFriendlyName": "New Name123",
    "style": "active_fire"
  }
]

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {
  @Input() productArray: Product[];

  treeControl: any = new NestedTreeControl<any>(node => {
    if(node.bandsGroups) {
     return node.bandsGroups.bands 
    }
  } );
  dataSource: any = new MatTreeNestedDataSource<any>();


  constructor() {
    this.dataSource.data = this.productArray;
    console.log(this.dataSource.data)
  }

  ngOnChanges() {
    this.dataSource.data = this.productArray;
  }

  hasChild(_: number, node: Product) {
    if(!node.bandsGroups) {
      return !!node
    } else {
      return !!node.bandsGroups.bands && node.bandsGroups.bands.length > 0
    }
  };
}
