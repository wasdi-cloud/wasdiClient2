import { Component } from '@angular/core';
import { ConsoleService } from 'src/app/services/api/console.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-edit-toolbar',
  templateUrl: './edit-toolbar.component.html',
  styleUrls: ['./edit-toolbar.component.css']
})
export class EditToolbarComponent {
  m_oActiveWorkspace: Workspace;

  constructor(
    private m_oConsoleService: ConsoleService,
    private m_oConstantsService: ConstantsService
  ) { 
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace(); 
  }



  filterRecursive(sFilterText: string, aoProductsArray: any[], sProperty: string) {
    let filteredData;

    function copy(o: any) {
      return Object.assign({}, o);
    }

    if (sFilterText) {
      sFilterText = sFilterText.toLowerCase();

      filteredData = aoProductsArray.map(copy).filter(function x(y) {
        if (y[sProperty].toLowerCase().includes(sFilterText)) {
          return true;
        }

        if (y.children) {
          return (y.children = y.children.map(copy).filter(x)).length;
        }
      });
    } else {
      filteredData = aoProductsArray;
    }
    return filteredData;
  }

  applyFilter(filterText: string) {
    console.log(filterText)
  }

  openJupyterNotebookPage(event: MouseEvent) {
    event.preventDefault
    this.m_oConsoleService.createConsole(this.m_oActiveWorkspace.workspaceId).subscribe(oResponse =>{
      window.open(oResponse.stringValue, "_blank")
    })
  }
}
