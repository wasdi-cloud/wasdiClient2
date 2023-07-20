import { TestBed } from '@angular/core/testing';

import { RabbitStompService } from './rabbit-stomp.service';

describe('RabbitStompService', () => {
  let service: RabbitStompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RabbitStompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
