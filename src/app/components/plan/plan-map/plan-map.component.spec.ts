import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMapComponent } from './plan-map.component';

describe('PlanMapComponent', () => {
  let component: PlanMapComponent;
  let fixture: ComponentFixture<PlanMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
