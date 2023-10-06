import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacesListDialogComponent } from './workspaces-list-dialog.component';

describe('WorkspacesListDialogComponent', () => {
  let component: WorkspacesListDialogComponent;
  let fixture: ComponentFixture<WorkspacesListDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspacesListDialogComponent]
    });
    fixture = TestBed.createComponent(WorkspacesListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
