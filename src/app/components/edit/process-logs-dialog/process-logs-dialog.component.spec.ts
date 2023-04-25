import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessLogsDialogComponent } from './process-logs-dialog.component';

describe('ProcessLogsDialogComponent', () => {
  let component: ProcessLogsDialogComponent;
  let fixture: ComponentFixture<ProcessLogsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessLogsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessLogsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
