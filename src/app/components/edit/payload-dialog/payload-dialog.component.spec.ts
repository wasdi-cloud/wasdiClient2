import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayloadDialogComponent } from './payload-dialog.component';

describe('PayloadDialogComponent', () => {
  let component: PayloadDialogComponent;
  let fixture: ComponentFixture<PayloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayloadDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
