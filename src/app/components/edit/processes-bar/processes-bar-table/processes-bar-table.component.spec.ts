import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessesBarTableComponent } from './processes-bar-table.component';

describe('ProcessesBarTableComponent', () => {
  let component: ProcessesBarTableComponent;
  let fixture: ComponentFixture<ProcessesBarTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessesBarTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessesBarTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
