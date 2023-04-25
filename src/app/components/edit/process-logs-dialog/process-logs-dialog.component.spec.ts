import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorLogsDialogComponent } from './process-logs-dialog.component';

describe('ProcessorLogsDialogComponent', () => {
  let component: ProcessorLogsDialogComponent;
  let fixture: ComponentFixture<ProcessorLogsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorLogsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessorLogsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
