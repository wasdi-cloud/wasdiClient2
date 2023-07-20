import { TestBed } from '@angular/core/testing';

import { AlertDialogTopService } from './alert-dialog-top.service';

describe('AlertDialogTopService', () => {
  let service: AlertDialogTopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertDialogTopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
