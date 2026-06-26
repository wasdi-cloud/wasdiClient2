import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabellingImportDialogComponent } from './labelling-import-dialog.component';

describe('ImportDialogComponent', () => {
  let component: LabellingImportDialogComponent;
  let fixture: ComponentFixture<LabellingImportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabellingImportDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabellingImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
