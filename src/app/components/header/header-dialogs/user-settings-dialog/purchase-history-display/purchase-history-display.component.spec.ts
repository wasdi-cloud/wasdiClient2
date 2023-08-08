import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseHistoryDisplayComponent } from './purchase-history-display.component';

describe('PurchaseHistoryDisplayComponent', () => {
  let component: PurchaseHistoryDisplayComponent;
  let fixture: ComponentFixture<PurchaseHistoryDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseHistoryDisplayComponent]
    });
    fixture = TestBed.createComponent(PurchaseHistoryDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
