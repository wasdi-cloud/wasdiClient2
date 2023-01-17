import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapSliderComponent } from './wap-slider.component';

describe('WapSliderComponent', () => {
  let component: WapSliderComponent;
  let fixture: ComponentFixture<WapSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
