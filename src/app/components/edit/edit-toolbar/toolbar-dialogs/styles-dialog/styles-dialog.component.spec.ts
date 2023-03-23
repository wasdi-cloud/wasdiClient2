import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StylesDialogComponent } from './styles-dialog.component';

describe('StylesDialogComponent', () => {
  let component: StylesDialogComponent;
  let fixture: ComponentFixture<StylesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StylesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StylesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
