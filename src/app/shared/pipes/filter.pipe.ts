import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if(!items) {
      console.log("No Items")
      return [];
    }

    if(!searchText) {
      console.log("No search text")
      return items; 
    }
    searchText = searchText.toLocaleLowerCase(); 

    return items.filter(item => {
      if(item.friendlyName) {
        return item.friendlyName.toLocaleLowerCase().includes(searchText); 
      }
      if(item.name) {
        return item.name.toLocaleLowerCase().includes(searchText);
      }
    })
  }

}
