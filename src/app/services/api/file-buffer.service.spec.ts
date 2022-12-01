import { TestBed } from '@angular/core/testing';

import { FileBufferService } from './file-buffer.service';

describe('FileBufferService', () => {
  let service: FileBufferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileBufferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
