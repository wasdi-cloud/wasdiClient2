import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanTreeComponent } from './plan-tree.component';

describe('PlanTreeComponent', () => {
  let component: PlanTreeComponent;
  let fixture: ComponentFixture<PlanTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
