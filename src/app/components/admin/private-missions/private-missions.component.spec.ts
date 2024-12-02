import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateMissionsComponent } from './private-missions.component';

describe('PrivateMissionsComponent', () => {
  let component: PrivateMissionsComponent;
  let fixture: ComponentFixture<PrivateMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateMissionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
