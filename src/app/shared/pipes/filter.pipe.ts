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
      else if (item.name) {
        if (typeof item.name === 'number') {
          return item.name === parseInt(searchText);
        }
        return item.name.toLocaleLowerCase().includes(searchText);
      }
      //Search Logs by Row: 
      else if (item.logRow) {
        return item.logRow.toLocaleLowerCase().includes(searchText);
      }
      //Filter for package manager:
      else if (item.packageName) {
        return item.packageName.toLocaleLowerCase().includes(searchText);
      }
      //Filter for Search Page results: 
      else if (item.provider) {
        return item.provider.toLocaleLowerCase().includes(searchText);
      }
      //Filter For Search Apps (Apps Dialog) results:
      else if (item.processorName) {
        return item.processorName.toLocaleLowerCase().includes(searchText);
      }
      //Filter for Workspaces where workspaceName is an attribute:
      else if (item.workspaceName) {
        return item.workspaceName.toLocaleLowerCase().includes(searchText);
      }
      else if (item.publisher) {
        return item.publisher.toLocaleLowerCase().includes(searchText);
      } else {
        return item.toLocaleLowerCase().includes(searchText);
      }

    })
  }
}
