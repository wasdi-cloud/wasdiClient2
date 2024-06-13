import { TestBed } from '@angular/core/testing';

import { IsSigndInGuard } from './is-signed-in.guard';

describe('IsSigndInGuard', () => {
  let guard: IsSigndInGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsSigndInGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
