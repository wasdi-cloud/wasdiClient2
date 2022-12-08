import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacesWorldwindComponent } from './workspaces-worldwind.component';

describe('WorkspacesWorldwindComponent', () => {
  let component: WorkspacesWorldwindComponent;
  let fixture: ComponentFixture<WorkspacesWorldwindComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspacesWorldwindComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspacesWorldwindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
