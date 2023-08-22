import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkflowDialogComponent } from './edit-workflow-dialog.component';

describe('EditWorkflowDialogComponent', () => {
  let component: EditWorkflowDialogComponent;
  let fixture: ComponentFixture<EditWorkflowDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditWorkflowDialogComponent]
    });
    fixture = TestBed.createComponent(EditWorkflowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
