import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStyleDialogComponent } from './edit-style-dialog.component';

describe('EditStyleDialogComponent', () => {
  let component: EditStyleDialogComponent;
  let fixture: ComponentFixture<EditStyleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditStyleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStyleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
