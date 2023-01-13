import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacesMapComponent } from './workspaces-map.component';

describe('WorkspacesMapComponent', () => {
  let component: WorkspacesMapComponent;
  let fixture: ComponentFixture<WorkspacesMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspacesMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspacesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
