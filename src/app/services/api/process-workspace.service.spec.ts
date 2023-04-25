import { TestBed } from '@angular/core/testing';

import { ProcessWorkspaceService } from './process-workspace.service';

describe('ProcessWorkspaceService', () => {
  let service: ProcessWorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessWorkspaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
