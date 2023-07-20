import { TestBed } from '@angular/core/testing';

import { NotificationDisplayService } from './notification-display.service';

describe('NotificationDisplayService', () => {
  let service: NotificationDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
