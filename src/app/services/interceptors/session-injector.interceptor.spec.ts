import { TestBed } from '@angular/core/testing';

import { SessionInjectorInterceptor } from './session-injector.interceptor';

describe('SessionInjectorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SessionInjectorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SessionInjectorInterceptor = TestBed.inject(SessionInjectorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
