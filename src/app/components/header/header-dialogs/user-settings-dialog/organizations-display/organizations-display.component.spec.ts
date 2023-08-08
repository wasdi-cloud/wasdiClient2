import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsDisplayComponent } from './organizations-display.component';

describe('OrganizationsDisplayComponent', () => {
  let component: OrganizationsDisplayComponent;
  let fixture: ComponentFixture<OrganizationsDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationsDisplayComponent]
    });
    fixture = TestBed.createComponent(OrganizationsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
