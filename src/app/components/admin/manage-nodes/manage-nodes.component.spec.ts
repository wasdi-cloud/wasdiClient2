import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNodesComponent } from './manage-nodes.component';

describe('ManageNodesComponent', () => {
  let component: ManageNodesComponent;
  let fixture: ComponentFixture<ManageNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNodesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
