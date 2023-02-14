import { Component, Input } from '@angular/core';
import { Product } from 'src/app/shared/models/product.model';


//Angular Material Imports:
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface ProductNode extends Product {
  selected?: boolean;
  indeterminate?: boolean;
}

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {
  @Input() productArray: Product[];
  treeControl: NestedTreeControl<any>
  dataSource: MatTreeNestedDataSource<any>

  constructor() {
    this.treeControl = new NestedTreeControl<any>(node => {
      if (node.bandsGroups) {
        return node.bandsGroups.bands
      }
    });
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnChanges() {
    this.dataSource.data = this.productArray;
  }

  hasChild(_: number, node: Product) {
    if (!node.bandsGroups) {
      return !!node
    } else {
      return !!node.bandsGroups.bands && node.bandsGroups.bands.length > 0
    }
  };
}
