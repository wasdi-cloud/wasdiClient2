import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsBuyDialogComponent } from './credits-buy-dialog.component';

describe('CreditsBuyDialogComponent', () => {
  let component: CreditsBuyDialogComponent;
  let fixture: ComponentFixture<CreditsBuyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditsBuyDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsBuyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
