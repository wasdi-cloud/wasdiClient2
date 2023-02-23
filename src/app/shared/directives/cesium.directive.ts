import { Directive, OnInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCesium]'
})
export class CesiumDirective implements OnInit{

  constructor(private element: ElementRef) { }

  ngOnInit(): void {
    const viewer = new Cesium.Viewer(this.element.nativeElement);
  }

}
