import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewInputComponent } from './review-input.component';

describe('ReviewInputComponent', () => {
  let component: ReviewInputComponent;
  let fixture: ComponentFixture<ReviewInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
