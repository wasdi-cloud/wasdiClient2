import { TestBed } from '@angular/core/testing';

import { ProcessorMediaService } from './processor-media.service';

describe('ProcessorMediaService', () => {
  let service: ProcessorMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessorMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
