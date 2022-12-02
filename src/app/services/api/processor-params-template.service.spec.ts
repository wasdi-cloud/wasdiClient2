import { TestBed } from '@angular/core/testing';

import { ProcessorParamsTemplateService } from './processor-params-template.service';

describe('ProcessorParamsTemplateService', () => {
  let service: ProcessorParamsTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessorParamsTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
