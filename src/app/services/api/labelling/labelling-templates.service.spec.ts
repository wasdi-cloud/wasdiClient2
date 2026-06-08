import { TestBed } from '@angular/core/testing';

import { LabellingTemplatesService } from './labelling-templates.service';

describe('LabellingTemplatesService', () => {
  let service: LabellingTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabellingTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
