import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualBoundingBoxComponent } from './manual-bounding-box.component';

describe('ManualBoundingBoxComponent', () => {
  let component: ManualBoundingBoxComponent;
  let fixture: ComponentFixture<ManualBoundingBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualBoundingBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualBoundingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
