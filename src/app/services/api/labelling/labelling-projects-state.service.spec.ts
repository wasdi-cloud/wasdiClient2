import { TestBed } from '@angular/core/testing';

import { LabellingProjectsStateService } from './labelling-projects-state.service';

describe('LabellingProjectsStateService', () => {
  let service: LabellingProjectsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabellingProjectsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
