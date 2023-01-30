import { Component, Input } from '@angular/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

@Component({
  selector: 'app-wap-products-combo',
  templateUrl: './wap-products-combo.component.html',
  styleUrls: ['./wap-products-combo.component.css']
})
export class WapProductsComboComponent {
  @Input() productsArray: string[];

  constructor(private m_oWorkspaceService: WorkspaceService) { }

  ngOnChanges() {
   console.log(this.productsArray)
  }
}
