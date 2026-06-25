import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingExportComponent } from './labelling-export.component';

describe('LabellingExportComponent', () => {
  let component: LabellingExportComponent;
  let fixture: ComponentFixture<LabellingExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
