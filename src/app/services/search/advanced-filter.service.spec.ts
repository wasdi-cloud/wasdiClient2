import { TestBed } from '@angular/core/testing';

import { AdvancedFilterService } from './advanced-filter.service';

describe('AdvancedFilterService', () => {
  let service: AdvancedFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
