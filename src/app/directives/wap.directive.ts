import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appWap]',
    standalone: false
})
export class WapDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
