import { ElementRef } from '@angular/core';
import { CesiumDirective } from './cesium.directive';

describe('CesiumDirective', () => {
  it('should create an instance', () => {
    const elementRef = {
      nativeElement: document.createElement('div')
    } as ElementRef;
    const directive = new CesiumDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
