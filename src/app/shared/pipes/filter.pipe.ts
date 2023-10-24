import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }

    if (!searchText) {
      return items;
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter(item => {
      //Products by Friendly Name: 
      if (item.friendlyName) {
        return item.friendlyName.toLocaleLowerCase().includes(searchText);
      }
      //Any Search with name attribute: 
      if (item.name) {
        return item.name.toLocaleLowerCase().includes(searchText);
      }
      //Search Logs by Row: 
      if (item.logRow) {
        return item.logRow.toLocaleLowerCase().includes(searchText);
      }
      //Filter for package manager:
      if (item.packageName) {
        return item.packageName.toLocaleLowerCase().includes(searchText);
      }
      //Filter for Search Page results: 
      if(item.provider) {
        return item.provider.toLocaleLowerCase().includes(searchText);
      }
      //Filter For Search Apps (Apps Dialog) results:
      if(item.processorName) {
        return item.processorName.toLocaleLowerCase().includes(searchText);
      }
      //Filter for Workspaces where workspaceName is an attribute:
      if(item.workspaceName) {
        return item.workspaceName.toLocaleLowerCase().includes(searchText);
      }

    })
  }
}
