import { TestBed } from '@angular/core/testing';

import { ResultOfSearchService } from './result-of-search.service';

describe('ResultOfSearchService', () => {
  let service: ResultOfSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultOfSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
