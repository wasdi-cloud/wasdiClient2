import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProcessorDialogComponent } from './edit-processor-dialog.component';

describe('EditProcessorDialogComponent', () => {
  let component: EditProcessorDialogComponent;
  let fixture: ComponentFixture<EditProcessorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditProcessorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProcessorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
