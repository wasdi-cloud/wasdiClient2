import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingToolbarComponent } from './labelling-toolbar.component';

describe('LabellingToolbarComponent', () => {
  let component: LabellingToolbarComponent;
  let fixture: ComponentFixture<LabellingToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
