import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorTabPricingComponent } from './processor-tab-pricing.component';

xdescribe('ProcessorTabPricingComponent', () => {
  let component: ProcessorTabPricingComponent;
  let fixture: ComponentFixture<ProcessorTabPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorTabPricingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessorTabPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
