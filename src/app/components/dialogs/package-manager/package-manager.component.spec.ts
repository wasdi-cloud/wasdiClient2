import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageManagerComponent } from './package-manager.component';

describe('PackageManagerComponent', () => {
  let component: PackageManagerComponent;
  let fixture: ComponentFixture<PackageManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageManagerComponent]
    });
    fixture = TestBed.createComponent(PackageManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
