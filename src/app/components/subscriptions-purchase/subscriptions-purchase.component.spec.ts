import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsPurchaseComponent } from './subscriptions-purchase.component';

describe('SubscriptionsPurchaseComponent', () => {
  let component: SubscriptionsPurchaseComponent;
  let fixture: ComponentFixture<SubscriptionsPurchaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionsPurchaseComponent]
    });
    fixture = TestBed.createComponent(SubscriptionsPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
