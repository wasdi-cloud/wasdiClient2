import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapDateTimePickerComponent } from './wap-date-time-picker.component';

describe('WapDateTimePickerComponent', () => {
  let component: WapDateTimePickerComponent;
  let fixture: ComponentFixture<WapDateTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapDateTimePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapDateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
