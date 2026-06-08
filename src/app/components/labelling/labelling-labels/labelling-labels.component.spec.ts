import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingLabelsComponent } from './labelling-labels.component';

describe('LabellingLabelsComponent', () => {
  let component: LabellingLabelsComponent;
  let fixture: ComponentFixture<LabellingLabelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingLabelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
