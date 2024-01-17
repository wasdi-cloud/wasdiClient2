import { TestBed } from '@angular/core/testing';

import { NotificationsQueueService } from './notifications-queue.service';

describe('NotificationsQueueService', () => {
  let service: NotificationsQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
