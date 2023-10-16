import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FTPDialogComponent } from './ftp-dialog.component';

describe('FTPDialogComponent', () => {
  let component: FTPDialogComponent;
  let fixture: ComponentFixture<FTPDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FTPDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
