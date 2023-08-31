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
    })
  }

}
