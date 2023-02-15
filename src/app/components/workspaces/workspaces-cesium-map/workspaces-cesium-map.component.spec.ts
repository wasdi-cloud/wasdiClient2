import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacesCesiumMapComponent } from './workspaces-cesium-map.component';

describe('WorkspacesCesiumMapComponent', () => {
  let component: WorkspacesCesiumMapComponent;
  let fixture: ComponentFixture<WorkspacesCesiumMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspacesCesiumMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspacesCesiumMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
