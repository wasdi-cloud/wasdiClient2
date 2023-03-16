import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceInfoDialogComponent } from './workspace-info-dialog.component';

describe('WorkspaceInfoDialogComponent', () => {
  let component: WorkspaceInfoDialogComponent;
  let fixture: ComponentFixture<WorkspaceInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
