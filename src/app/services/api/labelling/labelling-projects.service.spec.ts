import { TestBed } from '@angular/core/testing';

import { LabellingProjectsService } from './labelling-projects.service';

describe('LabellingProjectsService', () => {
  let service: LabellingProjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabellingProjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
