import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacesMenuComponent } from './workspaces-menu.component';

describe('WorkspacesMenuComponent', () => {
  let component: WorkspacesMenuComponent;
  let fixture: ComponentFixture<WorkspacesMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspacesMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspacesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
