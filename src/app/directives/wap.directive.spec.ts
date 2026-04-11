import { ViewContainerRef } from '@angular/core';
import { WapDirective } from './wap.directive';

describe('WapDirective', () => {
  it('should create an instance', () => {
    const viewContainerRef = {} as ViewContainerRef;
    const directive = new WapDirective(viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
