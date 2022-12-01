import { TestBed } from '@angular/core/testing';

import { OpportunitySearchService } from './opportunity-search.service';

describe('OpportunitySearchService', () => {
  let service: OpportunitySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunitySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
