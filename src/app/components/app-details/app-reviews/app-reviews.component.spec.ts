import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppReviewsComponent } from './app-reviews.component';

xdescribe('AppReviewsComponent', () => {
  let component: AppReviewsComponent;
  let fixture: ComponentFixture<AppReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppReviewsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
