import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceListItemComponent } from './workspace-list-item.component';

describe('WorkspaceListItemComponent', () => {
  let component: WorkspaceListItemComponent;
  let fixture: ComponentFixture<WorkspaceListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceListItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
