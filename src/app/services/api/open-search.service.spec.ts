import { TestBed } from '@angular/core/testing';

import { OpenSearchService } from './open-search.service';

describe('OpenSearchService', () => {
  let service: OpenSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
