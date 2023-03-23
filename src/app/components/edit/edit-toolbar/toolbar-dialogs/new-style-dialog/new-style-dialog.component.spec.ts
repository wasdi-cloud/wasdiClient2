import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStyleDialogComponent } from './new-style-dialog.component';

describe('NewStyleDialogComponent', () => {
  let component: NewStyleDialogComponent;
  let fixture: ComponentFixture<NewStyleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewStyleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewStyleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
