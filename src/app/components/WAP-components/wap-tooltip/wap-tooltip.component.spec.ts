import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapTooltipComponent } from './wap-tooltip.component';

describe('WapTooltipComponent', () => {
  let component: WapTooltipComponent;
  let fixture: ComponentFixture<WapTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
