import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapNumericBoxComponent } from './wap-numeric-box.component';

describe('WapNumericBoxComponent', () => {
  let component: WapNumericBoxComponent;
  let fixture: ComponentFixture<WapNumericBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapNumericBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapNumericBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
