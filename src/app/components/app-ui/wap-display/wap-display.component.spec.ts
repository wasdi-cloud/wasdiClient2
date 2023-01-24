import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapDisplayComponent } from './wap-display.component';

describe('WapDisplayComponent', () => {
  let component: WapDisplayComponent;
  let fixture: ComponentFixture<WapDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
