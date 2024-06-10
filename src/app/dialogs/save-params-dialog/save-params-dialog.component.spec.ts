import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveParamsDialogComponent } from './save-params-dialog.component';

describe('SaveParamsDialogComponent', () => {
  let component: SaveParamsDialogComponent;
  let fixture: ComponentFixture<SaveParamsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveParamsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveParamsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
