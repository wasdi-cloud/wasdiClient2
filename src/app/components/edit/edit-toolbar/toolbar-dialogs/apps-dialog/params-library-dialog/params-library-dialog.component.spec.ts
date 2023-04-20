import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamsLibraryDialogComponent } from './params-library-dialog.component';

describe('ParamsLibraryDialogComponent', () => {
  let component: ParamsLibraryDialogComponent;
  let fixture: ComponentFixture<ParamsLibraryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamsLibraryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamsLibraryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
