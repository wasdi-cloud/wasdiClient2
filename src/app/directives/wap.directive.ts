import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appWap]'
})
export class WapDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
