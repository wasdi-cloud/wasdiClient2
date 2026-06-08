import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingProjectsComponent } from './labelling-projects.component';

describe('LabellingProjectsComponent', () => {
  let component: LabellingProjectsComponent;
  let fixture: ComponentFixture<LabellingProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
