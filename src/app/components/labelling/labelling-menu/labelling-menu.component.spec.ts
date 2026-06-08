import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingMenuComponent } from './labelling-menu.component';

describe('LabellingMenuComponent', () => {
  let component: LabellingMenuComponent;
  let fixture: ComponentFixture<LabellingMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
