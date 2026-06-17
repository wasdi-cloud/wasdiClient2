import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingTemplatesComponent } from './labelling-templates.component';

describe('LabellingTemplatesComponent', () => {
  let component: LabellingTemplatesComponent;
  let fixture: ComponentFixture<LabellingTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
