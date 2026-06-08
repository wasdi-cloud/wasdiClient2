import { TestBed } from '@angular/core/testing';

import { ImageStyleService } from './image-style.service';

describe('ImageStyleService', () => {
  let service: ImageStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
