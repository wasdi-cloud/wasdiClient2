import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorkspaceDialogComponent } from './new-workspace-dialog.component';

describe('NewWorkspaceDialogComponent', () => {
  let component: NewWorkspaceDialogComponent;
  let fixture: ComponentFixture<NewWorkspaceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewWorkspaceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewWorkspaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
