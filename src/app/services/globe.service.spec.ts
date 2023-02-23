import { TestBed } from '@angular/core/testing';

import { GlobeService } from './globe.service';

describe('GlobeService', () => {
  let service: GlobeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
