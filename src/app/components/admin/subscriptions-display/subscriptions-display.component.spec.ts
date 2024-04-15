import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsDisplayComponent } from './subscriptions-display.component';

describe('SubscriptionsDisplayComponent', () => {
  let component: SubscriptionsDisplayComponent;
  let fixture: ComponentFixture<SubscriptionsDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionsDisplayComponent]
    });
    fixture = TestBed.createComponent(SubscriptionsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
