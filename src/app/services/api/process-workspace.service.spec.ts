import { TestBed } from '@angular/core/testing';

import { ProcessWorkspaceServiceService } from './process-workspace.service';

describe('ProcessWorkspaceServiceService', () => {
  let service: ProcessWorkspaceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessWorkspaceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
