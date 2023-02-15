import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkspaceService } from 'src/app/services/api/workspace.service';

@Component({
  selector: 'app-wap-products-combo',
  templateUrl: './wap-products-combo.component.html',
  styleUrls: ['./wap-products-combo.component.css']
})
export class WapProductsComboComponent {
  @Input() productsArray: string[];
  @Input() oControlSelection: any; 
  @Output() oControlSelectionChange = new EventEmitter<any>(); 

  constructor(private m_oWorkspaceService: WorkspaceService) { }


  getUserInput(event) {
    console.log(event.option.value)
    let sUserInput = event.option.value; 
    this.oControlSelection.sSelectedValues = sUserInput; 
    
    this.oControlSelectionChange.emit(this.oControlSelection); 
  }
}
