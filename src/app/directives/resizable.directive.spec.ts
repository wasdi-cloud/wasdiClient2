import { ElementRef } from '@angular/core';
import { ResizableDirective } from './resizable.directive';

describe('ResizableDirective', () => {
  it('should create an instance', () => {
    const elementRef = {
      nativeElement: document.createElement('div')
    } as ElementRef;
    const directive = new ResizableDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
