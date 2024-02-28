import { TestBed } from '@angular/core/testing';

import { LightSearchService } from './light-search.service';

describe('LightSearchService', () => {
  let service: LightSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
