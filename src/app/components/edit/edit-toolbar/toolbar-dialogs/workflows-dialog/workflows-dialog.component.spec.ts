import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsDialogComponent } from './workflows-dialog.component';

describe('WorkflowsDialogComponent', () => {
  let component: WorkflowsDialogComponent;
  let fixture: ComponentFixture<WorkflowsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
