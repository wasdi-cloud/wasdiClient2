import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavLayersComponent } from './nav-layers.component';

describe('NavLayersComponent', () => {
  let component: NavLayersComponent;
  let fixture: ComponentFixture<NavLayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavLayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
