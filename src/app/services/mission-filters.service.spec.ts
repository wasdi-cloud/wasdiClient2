import { TestBed } from '@angular/core/testing';

import { MissionFiltersService } from './mission-filters.service';

describe('MissionFiltersService', () => {
  let service: MissionFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionFiltersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
